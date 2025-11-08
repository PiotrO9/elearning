import { Request, Response } from 'express';
import { sendSuccess, sendNoContent, sendError } from '../utils/response';
import { PaginatedListResponse } from '../types/api';
import { buildPagination } from '../utils/pagination';
import { asyncHandler } from '../middleware/asyncHandler';
import { handlePrismaError } from '../utils/prismaErrors';
import {
	createVideo,
	updateVideo,
	deleteVideo,
	attachExistingVideoToCourse,
	detachVideoFromCourse,
	listAllVideos,
	getVideoById,
} from '../services/videoService';
import { VideoDto } from '../types/video';

export const handleCreateVideo = asyncHandler(
	async (req: Request, res: Response): Promise<void> => {
		const id = await createVideo(req.body);
		sendSuccess(res, { id }, 'Video created', 201);
	},
	(error: unknown, _req: Request, res: Response) => {
		const prismaError = handlePrismaError(error, 'video_order');
		if (prismaError) {
			sendError(res, prismaError.message, prismaError.statusCode, prismaError.code);
			return true;
		}
		return false;
	},
);

export const handleListVideos = asyncHandler(async (req: Request, res: Response): Promise<void> => {
	const { page, limit, sortBy, sortOrder } = req.query as unknown as {
		page: number;
		limit: number;
		sortBy?: string;
		sortOrder?: 'asc' | 'desc';
	};

	const result = await listAllVideos(
		page,
		limit,
		sortBy,
		sortOrder,
	);
	const payload: VideoDto[] = result.items.map(v => ({
		id: v.id,
		courseId: v.courseId,
		title: v.title,
		order: v.order,
		isTrailer: v.isTrailer,
		sourceUrl: v.sourceUrl,
		durationSeconds: v.durationSeconds,
	}));

	const response: PaginatedListResponse<VideoDto> = {
		items: payload,
		pagination: buildPagination(result.total, page, limit),
	};
	sendSuccess(res, response);
});

export const handleGetVideoById = asyncHandler(
	async (req: Request, res: Response): Promise<void> => {
		const { id } = req.params as any as { id: string };
		const video = await getVideoById(id);
		if (!video) {
			return sendError(res, 'Video not found', 404, 'VIDEO_NOT_FOUND');
		}

		const payload: VideoDto = {
			id: video.id,
			courseId: video.courseId,
			title: video.title,
			order: video.order,
			isTrailer: video.isTrailer,
			sourceUrl: video.sourceUrl,
			durationSeconds: video.durationSeconds,
		};
		sendSuccess(res, payload);
	},
);

export const handleUpdateVideo = asyncHandler(
	async (req: Request, res: Response): Promise<void> => {
		const { id } = req.params as any as { id: string };
		await updateVideo(id, req.body);
		sendNoContent(res);
	},
	(error: unknown, _req: Request, res: Response) => {
		const prismaError = handlePrismaError(error, 'video');
		if (prismaError) {
			sendError(res, prismaError.message, prismaError.statusCode, prismaError.code);
			return true;
		}
		return false;
	},
);

export const handleDeleteVideo = asyncHandler(
	async (req: Request, res: Response): Promise<void> => {
		const { id } = req.params as any as { id: string };
		await deleteVideo(id);
		sendNoContent(res);
	},
	(error: unknown, _req: Request, res: Response) => {
		const prismaError = handlePrismaError(error, 'video');
		if (prismaError) {
			sendError(res, prismaError.message, prismaError.statusCode, prismaError.code);
			return true;
		}
		return false;
	},
);

export const handleAttachVideoToCourse = asyncHandler(
	async (req: Request, res: Response): Promise<void> => {
		const { id: videoId, courseId } = req.params as any as { id: string; courseId: string };
		await attachExistingVideoToCourse(videoId, courseId, req.body);
		sendNoContent(res);
	},
	(error: unknown, _req: Request, res: Response) => {
		const prismaErrorOrder = handlePrismaError(error, 'video_order');
		if (prismaErrorOrder) {
			sendError(res, prismaErrorOrder.message, prismaErrorOrder.statusCode, prismaErrorOrder.code);
			return true;
		}
		const prismaErrorNotFound = handlePrismaError(error);
		if (prismaErrorNotFound) {
			sendError(res, 'Video or Course not found', 404, 'NOT_FOUND');
			return true;
		}
		return false;
	},
);

export const handleDetachVideoFromCourse = asyncHandler(
	async (req: Request, res: Response): Promise<void> => {
		const { id } = req.params as any as { id: string };
		await detachVideoFromCourse(id);
		sendNoContent(res);
	},
	(error: unknown, _req: Request, res: Response) => {
		const prismaError = handlePrismaError(error, 'video');
		if (prismaError) {
			sendError(res, prismaError.message, prismaError.statusCode, prismaError.code);
			return true;
		}
		return false;
	},
);
