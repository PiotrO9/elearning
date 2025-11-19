import { Request, Response } from 'express';
import { sendSuccess, sendNoContent, sendError } from '../utils/response';
import { PaginatedListResponse } from '../types/api';
import { buildPagination } from '../utils/pagination';
import { asyncHandler } from '../middleware/asyncHandler';
import {
	enrollUserByCourse,
	unenrollUser,
	getCourseEnrollments,
	getUserEnrollments,
	joinPublicCourse,
} from '../services/enrollmentService';
import { EnrollmentDto, UserCourseDto, UserCoursesResponse, UserInfo } from '../types/enrollment';

/**
 * POST /courses/:id/enroll
 * Admin przypisuje użytkownika do kursu
 */
export const handleEnrollUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
	const { id: courseId } = req.params as any as { id: string };
	const { userId } = req.body as { userId: string };
	const adminId = req.user!.userId;

	await enrollUserByCourse(userId, courseId, adminId);
	sendSuccess(res, null, 'User enrolled successfully', 201);
});

/**
 * POST /courses/:id/join
 * Użytkownik dołącza do publicznego kursu
 */
export const handleJoinCourse = asyncHandler(async (req: Request, res: Response): Promise<void> => {
	const { id: courseId } = req.params as any as { id: string };
	const userId = req.user!.userId;

	await joinPublicCourse(userId, courseId);
	sendSuccess(res, null, 'Joined course successfully', 201);
});

/**
 * DELETE /courses/:id/enrollments/:userId
 * Admin usuwa dostęp użytkownika do kursu
 */
export const handleUnenrollUser = asyncHandler(
	async (req: Request, res: Response): Promise<void> => {
		const { id: courseId, userId } = req.params as any as { id: string; userId: string };

		await unenrollUser(userId, courseId);
		sendNoContent(res);
	},
);

/**
 * GET /courses/:id/enrollments
 * Pobiera listę użytkowników zapisanych na kurs
 */
export const handleGetCourseEnrollments = asyncHandler(
	async (req: Request, res: Response): Promise<void> => {
		const { id: courseId } = req.params as any as { id: string };
		const { page, limit, sortBy, sortOrder } = req.query as unknown as {
			page: number;
			limit: number;
			sortBy?: string;
			sortOrder?: 'asc' | 'desc';
		};

		const result = await getCourseEnrollments(courseId, page, limit, sortBy, sortOrder);

		const payload: EnrollmentDto[] = result.items.map(e => ({
			id: e.id,
			userId: e.user.id,
			username: e.user.username,
			email: e.user.email,
			enrolledAt: e.createdAt,
			enrolledBy: e.enrolledBy,
		}));

		const response: PaginatedListResponse<EnrollmentDto> = {
			items: payload,
			pagination: buildPagination(result.total, page, limit),
		};
		sendSuccess(res, response);
	},
);

/**
 * GET /users/:userId/courses
 * Pobiera listę kursów użytkownika
 */
export const handleGetUserCourses = asyncHandler(
	async (req: Request, res: Response): Promise<void> => {
		const { userId } = req.params as any as { userId: string };
		const { page, limit, sortBy, sortOrder } = req.query as unknown as {
			page: number;
			limit: number;
			sortBy?: string;
			sortOrder?: 'asc' | 'desc';
		};

		const result = await getUserEnrollments(userId, page, limit, sortBy, sortOrder);

		if (!result.user) {
			return sendError(res, 'User not found', 404, 'USER_NOT_FOUND');
		}

		const courses: UserCourseDto[] = result.items.map(e => ({
			id: e.course.id,
			title: e.course.title,
			summary: e.course.summary,
			imagePath: e.course.imagePath,
			isPublic: e.course.isPublic,
			enrolledAt: e.createdAt,
		}));

		const userInfo: UserInfo = {
			id: result.user.id,
			username: result.user.username,
			email: result.user.email,
			role: result.user.role,
			createdAt: result.user.createdAt,
			lastSeen: result.user.lastSeen,
		};

		const response: UserCoursesResponse = {
			user: userInfo,
			courses,
			pagination: buildPagination(result.total, page, limit),
		};
		sendSuccess(res, response);
	},
);
