import { Request, Response } from 'express';
import { sendSuccess, sendNoContent, sendError, buildValidationErrors } from '../utils/response';
import { ValidationError } from '../types/api';
import {
	enrollUserByCourse,
	unenrollUser,
	getCourseEnrollments,
	getUserEnrollments,
	joinPublicCourse,
	EnrollmentServiceError,
} from '../services/enrollmentService';
import {
	enrollUserSchema,
	courseIdParamSchema,
	userIdParamSchema,
} from '../utils/validationSchemas';
import { EnrollmentDto, UserCourseDto } from '../types/enrollment';

/**
 * POST /courses/:id/enroll
 * Admin przypisuje użytkownika do kursu
 */
export async function handleEnrollUser(req: Request, res: Response): Promise<void> {
	try {
		const paramsValidation = courseIdParamSchema.safeParse(req.params);
		if (!paramsValidation.success) {
			const errors = buildValidationErrors(paramsValidation.error.issues);
			throw new ValidationError('Invalid course id', errors);
		}

		const bodyValidation = enrollUserSchema.safeParse(req.body);
		if (!bodyValidation.success) {
			const errors = buildValidationErrors(bodyValidation.error.issues);
			throw new ValidationError('Validation failed', errors);
		}

		const { id: courseId } = paramsValidation.data;
		const { userId } = bodyValidation.data;
		const adminId = req.user!.userId;

		await enrollUserByCourse(userId, courseId, adminId);
		sendSuccess(res, null, 'User enrolled successfully', 201);
	} catch (error) {
		if (error instanceof EnrollmentServiceError) {
			return sendError(res, error.message, error.statusCode, error.code);
		}
		if (error instanceof ValidationError) {
			return sendError(res, error.message, error.statusCode, error.code, error.errors);
		}
		return sendError(res, 'Failed to enroll user');
	}
}

/**
 * POST /courses/:id/join
 * Użytkownik dołącza do publicznego kursu
 */
export async function handleJoinCourse(req: Request, res: Response): Promise<void> {
	try {
		const paramsValidation = courseIdParamSchema.safeParse(req.params);
		if (!paramsValidation.success) {
			const errors = buildValidationErrors(paramsValidation.error.issues);
			throw new ValidationError('Invalid course id', errors);
		}

		const { id: courseId } = paramsValidation.data;
		const userId = req.user!.userId;

		await joinPublicCourse(userId, courseId);
		sendSuccess(res, null, 'Joined course successfully', 201);
	} catch (error) {
		if (error instanceof EnrollmentServiceError) {
			return sendError(res, error.message, error.statusCode, error.code);
		}
		if (error instanceof ValidationError) {
			return sendError(res, error.message, error.statusCode, error.code, error.errors);
		}
		return sendError(res, 'Failed to join course');
	}
}

/**
 * DELETE /courses/:id/enrollments/:userId
 * Admin usuwa dostęp użytkownika do kursu
 */
export async function handleUnenrollUser(req: Request, res: Response): Promise<void> {
	try {
		const courseParams = courseIdParamSchema.safeParse(req.params);
		if (!courseParams.success) {
			const errors = buildValidationErrors(courseParams.error.issues);
			throw new ValidationError('Invalid course id', errors);
		}

		const userParams = userIdParamSchema.safeParse(req.params);
		if (!userParams.success) {
			const errors = buildValidationErrors(userParams.error.issues);
			throw new ValidationError('Invalid user id', errors);
		}

		const { id: courseId } = courseParams.data;
		const { userId } = userParams.data;

		await unenrollUser(userId, courseId);
		sendNoContent(res);
	} catch (error) {
		if (error instanceof EnrollmentServiceError) {
			return sendError(res, error.message, error.statusCode, error.code);
		}
		if (error instanceof ValidationError) {
			return sendError(res, error.message, error.statusCode, error.code, error.errors);
		}
		return sendError(res, 'Failed to unenroll user');
	}
}

/**
 * GET /courses/:id/enrollments
 * Pobiera listę użytkowników zapisanych na kurs
 */
export async function handleGetCourseEnrollments(req: Request, res: Response): Promise<void> {
	try {
		const paramsValidation = courseIdParamSchema.safeParse(req.params);
		if (!paramsValidation.success) {
			const errors = buildValidationErrors(paramsValidation.error.issues);
			throw new ValidationError('Invalid course id', errors);
		}

		const { id: courseId } = paramsValidation.data;
		const enrollments = await getCourseEnrollments(courseId);

		const payload: EnrollmentDto[] = enrollments.map(e => ({
			id: e.id,
			userId: e.user.id,
			username: e.user.username,
			email: e.user.email,
			enrolledAt: e.createdAt,
			enrolledBy: e.enrolledBy,
		}));

		sendSuccess(res, { items: payload, total: payload.length });
	} catch (error) {
		if (error instanceof ValidationError) {
			return sendError(res, error.message, error.statusCode, error.code, error.errors);
		}
		return sendError(res, 'Failed to fetch course enrollments');
	}
}

/**
 * GET /users/:userId/courses
 * Pobiera listę kursów użytkownika
 */
export async function handleGetUserCourses(req: Request, res: Response): Promise<void> {
	try {
		const paramsValidation = userIdParamSchema.safeParse(req.params);
		if (!paramsValidation.success) {
			const errors = buildValidationErrors(paramsValidation.error.issues);
			throw new ValidationError('Invalid user id', errors);
		}

		const { userId } = paramsValidation.data;
		const enrollments = await getUserEnrollments(userId);

		const payload: UserCourseDto[] = enrollments.map(e => ({
			id: e.course.id,
			title: e.course.title,
			summary: e.course.summary,
			imagePath: e.course.imagePath,
			isPublic: e.course.isPublic,
			enrolledAt: e.createdAt,
		}));

		sendSuccess(res, { items: payload, total: payload.length });
	} catch (error) {
		if (error instanceof ValidationError) {
			return sendError(res, error.message, error.statusCode, error.code, error.errors);
		}
		return sendError(res, 'Failed to fetch user courses');
	}
}
