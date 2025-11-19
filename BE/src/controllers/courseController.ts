import { Request, Response } from 'express';
import { sendSuccess, sendNoContent, sendError } from '../utils/response';
import { asyncHandler } from '../middleware/asyncHandler';
import { handlePrismaError } from '../utils/prismaErrors';
import {
	listPublishedCourses,
	getCourseDetail,
	createCourse,
	deleteCourse,
	updateCourse,
	reorderCourseVideos,
} from '../services/courseService';
import { CourseListItemDto } from '../types/course';
import { mapCourseToDetailDto } from '../utils/mappers/courseMapper';
import { buildPagination } from '../utils/pagination';
import { PaginatedListResponse } from '../types/api';

export const handleGetCourses = asyncHandler(async (req: Request, res: Response): Promise<void> => {
	const {
		page,
		limit,
		sortBy,
		sortOrder,
		tag: tagSlug,
	} = req.query as unknown as {
		page: number;
		limit: number;
		sortBy?: string;
		sortOrder?: 'asc' | 'desc';
		tag?: string;
	};

	const result = await listPublishedCourses(tagSlug, page, limit, sortBy, sortOrder);
	const payload: CourseListItemDto[] = result.items.map(course => ({
		id: course.id,
		title: course.title,
		description: course.summary,
		imagePath: course.imagePath,
		isPublic: course.isPublic,
		tags: course.tags,
	}));

	const response: PaginatedListResponse<CourseListItemDto> = {
		items: payload,
		pagination: buildPagination(result.total, page, limit),
	};
	sendSuccess(res, response);
});

export const handleGetCourseById = asyncHandler(
	async (req: Request, res: Response): Promise<void> => {
		const { id } = req.params as { id: string };

		const isAuthenticated = Boolean(req.user?.userId);
		const course = await getCourseDetail(id, isAuthenticated);
		if (!course) {
			return sendError(res, 'Course not found', 404, 'COURSE_NOT_FOUND');
		}

		const payload = mapCourseToDetailDto(course);
		sendSuccess(res, payload);
	},
);

export const handleCreateCourse = asyncHandler(
	async (req: Request, res: Response): Promise<void> => {
		const course = await createCourse(req.body);
		const payload = mapCourseToDetailDto(course);

		sendSuccess(res, payload, 'Course created', 201);
	},
);

export const handleDeleteCourse = asyncHandler(
	async (req: Request, res: Response): Promise<void> => {
		const { id } = req.params as { id: string };
		await deleteCourse(id);
		sendNoContent(res);
	},
	(error: unknown, _req: Request, res: Response) => {
		const prismaError = handlePrismaError(error, 'course');
		if (prismaError) {
			sendError(res, prismaError.message, prismaError.statusCode, prismaError.code);
			return true;
		}
		return false;
	},
);

export const handleUpdateCourse = asyncHandler(
	async (req: Request, res: Response): Promise<void> => {
		const { id } = req.params as { id: string };
		const course = await updateCourse(id, req.body);
		const payload = mapCourseToDetailDto(course);

		sendSuccess(res, payload);
	},
	(error: unknown, _req: Request, res: Response) => {
		const prismaError = handlePrismaError(error, 'course');
		if (prismaError) {
			sendError(res, prismaError.message, prismaError.statusCode, prismaError.code);
			return true;
		}
		return false;
	},
);

export const handleReorderCourseVideos = asyncHandler(
	async (req: Request, res: Response): Promise<void> => {
		const { id } = req.params as { id: string };
		const { items } = req.body as { items: { id: string; order: number }[] };

		await reorderCourseVideos(id, items);
		sendNoContent(res);
	},
	(error: unknown, _req: Request, res: Response) => {
		if (error && typeof error === 'object' && 'code' in error) {
			const errorCode = (error as any).code;
			if (errorCode === 'VIDEO_NOT_IN_COURSE') {
				sendError(res, 'Video not in course', 404, 'VIDEO_NOT_IN_COURSE');
				return true;
			}
			if (errorCode === 'DUPLICATE_ORDER') {
				sendError(res, 'Duplicate order values', 400, 'DUPLICATE_ORDER');
				return true;
			}
		}
		const prismaError = handlePrismaError(error, 'video_order');
		if (prismaError) {
			sendError(res, prismaError.message, prismaError.statusCode, prismaError.code);
			return true;
		}
		return false;
	},
);
