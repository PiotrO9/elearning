import { prisma } from '../utils/prisma';
import { buildOrderBy } from '../utils/sorting';
import { EnrollmentWithUser, EnrollmentWithCourse } from '../types/enrollment';

export class EnrollmentServiceError extends Error {
	constructor(message: string, public statusCode: number, public code?: string) {
		super(message);
		this.name = 'EnrollmentServiceError';
	}
}

/**
 * Admin enrolls user to course
 */
export async function enrollUserByCourse(
	userId: string,
	courseId: string,
	enrolledByAdminId: string,
): Promise<void> {
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

	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: { id: true, deletedAt: true },
	});

	if (!user || user.deletedAt) {
		throw new EnrollmentServiceError('User not found', 404, 'USER_NOT_FOUND');
	}

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

	await prisma.courseEnrollment.create({
		data: {
			userId,
			courseId,
			enrolledBy: enrolledByAdminId,
		},
	});
}

/**
 * User joins public course
 */
export async function joinPublicCourse(userId: string, courseId: string): Promise<void> {
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

	await prisma.courseEnrollment.create({
		data: {
			userId,
			courseId,
			enrolledBy: null,
		},
	});
}

/**
 * Admin removes user access to course
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
 * Get list of users enrolled in course
 */
export async function getCourseEnrollments(
	courseId: string,
	page?: number,
	limit?: number,
	sortBy?: string,
	sortOrder?: 'asc' | 'desc',
): Promise<{ items: EnrollmentWithUser[]; total: number }> {
	const skip = page && limit ? (page - 1) * limit : undefined;
	const take = limit;

	const orderBy = buildOrderBy(
		sortBy,
		{
			validSortFields: ['createdAt', 'username', 'email'],
			defaultField: 'createdAt',
			defaultOrder: 'desc',
			relationSorts: {
				username: 'user.username',
				email: 'user.email',
			},
		},
		sortOrder,
	);

	const [enrollments, total] = await Promise.all([
		prisma.courseEnrollment.findMany({
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
			skip,
			take,
			orderBy,
		}),
		prisma.courseEnrollment.count({ where: { courseId } }),
	]);

	return {
		items: enrollments.map(e => ({
			id: e.id,
			userId: e.userId,
			courseId: e.courseId,
			enrolledBy: e.enrolledBy,
			createdAt: e.createdAt,
			user: e.user,
		})),
		total,
	};
}

/**
 * Get list of user courses
 */
export async function getUserEnrollments(
	userId: string,
	page?: number,
	limit?: number,
	sortBy?: string,
	sortOrder?: 'asc' | 'desc',
): Promise<{ items: EnrollmentWithCourse[]; total: number }> {
	const skip = page && limit ? (page - 1) * limit : undefined;
	const take = limit;

	const orderBy = buildOrderBy(
		sortBy,
		{
			validSortFields: ['title', 'enrolledAt'],
			defaultField: 'enrolledAt',
			defaultOrder: 'desc',
			fieldMapping: {
				enrolledAt: 'createdAt',
			},
			relationSorts: {
				title: 'course.title',
			},
		},
		sortOrder,
	);

	const [enrollments, total] = await Promise.all([
		prisma.courseEnrollment.findMany({
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
			skip,
			take,
			orderBy,
		}),
		prisma.courseEnrollment.count({ where: { userId } }),
	]);

	return {
		items: enrollments.map(e => ({
			id: e.id,
			userId: e.userId,
			courseId: e.courseId,
			enrolledBy: e.enrolledBy,
			createdAt: e.createdAt,
			course: e.course,
		})),
		total,
	};
}

/**
 * Check if user has access to course
 */
export async function checkUserCourseAccess(userId: string, courseId: string): Promise<boolean> {
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
