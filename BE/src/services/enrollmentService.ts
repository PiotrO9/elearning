import { prisma } from '../utils/prisma';
import { EnrollmentWithUser, EnrollmentWithCourse } from '../types/enrollment';

export class EnrollmentServiceError extends Error {
	constructor(message: string, public statusCode: number, public code?: string) {
		super(message);
		this.name = 'EnrollmentServiceError';
	}
}

/**
 * Admin przypisuje użytkownika do kursu
 */
export async function enrollUserByCourse(
	userId: string,
	courseId: string,
	enrolledByAdminId: string,
): Promise<void> {
	// Sprawdź czy kurs istnieje
	const course = await prisma.course.findUnique({
		where: { id: courseId },
		select: { id: true, isPublished: true },
	});

	if (!course) {
		throw new EnrollmentServiceError('Course not found', 404, 'COURSE_NOT_FOUND');
	}

	if (!course.isPublished) {
		throw new EnrollmentServiceError(
			'Cannot enroll in unpublished course',
			400,
			'COURSE_NOT_PUBLISHED',
		);
	}

	// Sprawdź czy użytkownik istnieje
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: { id: true, deletedAt: true },
	});

	if (!user || user.deletedAt) {
		throw new EnrollmentServiceError('User not found', 404, 'USER_NOT_FOUND');
	}

	// Sprawdź czy użytkownik jest już zapisany
	const existingEnrollment = await prisma.courseEnrollment.findUnique({
		where: {
			userId_courseId: {
				userId,
				courseId,
			},
		},
	});

	if (existingEnrollment) {
		throw new EnrollmentServiceError('User already enrolled', 409, 'ALREADY_ENROLLED');
	}

	// Zapisz użytkownika
	await prisma.courseEnrollment.create({
		data: {
			userId,
			courseId,
			enrolledBy: enrolledByAdminId,
		},
	});
}

/**
 * Użytkownik dołącza do publicznego kursu
 */
export async function joinPublicCourse(userId: string, courseId: string): Promise<void> {
	// Sprawdź czy kurs istnieje i jest publiczny
	const course = await prisma.course.findUnique({
		where: { id: courseId },
		select: { id: true, isPublished: true, isPublic: true },
	});

	if (!course) {
		throw new EnrollmentServiceError('Course not found', 404, 'COURSE_NOT_FOUND');
	}

	if (!course.isPublished) {
		throw new EnrollmentServiceError('Course is not published', 403, 'COURSE_NOT_PUBLISHED');
	}

	if (!course.isPublic) {
		throw new EnrollmentServiceError('Course is not public', 403, 'COURSE_NOT_PUBLIC');
	}

	// Sprawdź czy użytkownik jest już zapisany
	const existingEnrollment = await prisma.courseEnrollment.findUnique({
		where: {
			userId_courseId: {
				userId,
				courseId,
			},
		},
	});

	if (existingEnrollment) {
		throw new EnrollmentServiceError('Already enrolled', 409, 'ALREADY_ENROLLED');
	}

	// Zapisz użytkownika (bez enrolledBy bo to self-enrollment)
	await prisma.courseEnrollment.create({
		data: {
			userId,
			courseId,
			enrolledBy: null,
		},
	});
}

/**
 * Admin usuwa dostęp użytkownika do kursu
 */
export async function unenrollUser(userId: string, courseId: string): Promise<void> {
	const enrollment = await prisma.courseEnrollment.findUnique({
		where: {
			userId_courseId: {
				userId,
				courseId,
			},
		},
	});

	if (!enrollment) {
		throw new EnrollmentServiceError('Enrollment not found', 404, 'ENROLLMENT_NOT_FOUND');
	}

	await prisma.courseEnrollment.delete({
		where: {
			userId_courseId: {
				userId,
				courseId,
			},
		},
	});
}

/**
 * Pobierz listę użytkowników zapisanych na kurs
 */
export async function getCourseEnrollments(courseId: string): Promise<EnrollmentWithUser[]> {
	const enrollments = await prisma.courseEnrollment.findMany({
		where: { courseId },
		include: {
			user: {
				select: {
					id: true,
					username: true,
					email: true,
				},
			},
		},
		orderBy: { createdAt: 'desc' },
	});

	return enrollments.map(e => ({
		id: e.id,
		userId: e.userId,
		courseId: e.courseId,
		enrolledBy: e.enrolledBy,
		createdAt: e.createdAt,
		user: e.user,
	}));
}

/**
 * Pobierz listę kursów użytkownika
 */
export async function getUserEnrollments(userId: string): Promise<EnrollmentWithCourse[]> {
	const enrollments = await prisma.courseEnrollment.findMany({
		where: { userId },
		include: {
			course: {
				select: {
					id: true,
					title: true,
					summary: true,
					imagePath: true,
					isPublic: true,
				},
			},
		},
		orderBy: { createdAt: 'desc' },
	});

	return enrollments.map(e => ({
		id: e.id,
		userId: e.userId,
		courseId: e.courseId,
		enrolledBy: e.enrolledBy,
		createdAt: e.createdAt,
		course: e.course,
	}));
}

/**
 * Sprawdź czy użytkownik ma dostęp do kursu
 */
export async function checkUserCourseAccess(userId: string, courseId: string): Promise<boolean> {
	// Sprawdź czy kurs jest publiczny
	const course = await prisma.course.findUnique({
		where: { id: courseId },
		select: { isPublic: true, isPublished: true },
	});

	if (!course || !course.isPublished) {
		return false;
	}

	if (course.isPublic) {
		return true;
	}

	// Sprawdź enrollment
	const enrollment = await prisma.courseEnrollment.findUnique({
		where: {
			userId_courseId: {
				userId,
				courseId,
			},
		},
	});

	return !!enrollment;
}
