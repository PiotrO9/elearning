import { Request, Response } from 'express';
import { sendSuccess, sendNoContent, sendError, buildValidationErrors } from '../utils/response';
import { ConflictError, ValidationError } from '../types/api';
import {
	createVideoSchema,
	updateVideoSchema,
	videoIdParamSchema,
	courseIdParamSchema,
	attachVideoToCourseSchema,
} from '../utils/validationSchemas';
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

export async function handleCreateVideo(req: Request, res: Response): Promise<void> {
	try {
		const parsed = createVideoSchema.safeParse(req.body);
		if (!parsed.success) {
			const errors = buildValidationErrors(parsed.error.issues);
			throw new ValidationError('Validation failed', errors);
		}

		const id = await createVideo(parsed.data);
		sendSuccess(res, { id }, 'Video created', 201);
	} catch (error: any) {
		if (error?.code === 'P2002') {
			return sendError(res, 'Video order must be unique within course', 409, 'VIDEO_ORDER_CONFLICT');
		}
		if (error instanceof ValidationError || error instanceof ConflictError) {
			return sendError(res, error.message, error.statusCode, error.code, error.errors);
		}
		return sendError(res, 'Failed to create video', 500, 'INTERNAL_SERVER_ERROR');
	}
}

export async function handleListVideos(req: Request, res: Response): Promise<void> {
	req;
	try {
		const videos = await listAllVideos();
		const payload: VideoDto[] = videos.map(v => ({
			id: v.id,
			courseId: v.courseId,
			title: v.title,
			order: v.order,
			isTrailer: v.isTrailer,
			sourceUrl: v.sourceUrl,
			durationSeconds: v.durationSeconds,
		}));
		sendSuccess(res, { items: payload, total: payload.length });
	} catch (error) {
		sendError(res, 'Failed to fetch videos');
	}
}

export async function handleGetVideoById(req: Request, res: Response): Promise<void> {
	try {
		const params = videoIdParamSchema.safeParse(req.params);
		if (!params.success) {
			throw new ValidationError('Invalid video id', [{ message: 'Invalid id', field: 'id' }]);
		}

		const video = await getVideoById(params.data.id);
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
	} catch (error) {
		sendError(res, 'Failed to fetch video');
	}
}

export async function handleUpdateVideo(req: Request, res: Response): Promise<void> {
	try {
		const params = videoIdParamSchema.safeParse(req.params);
		if (!params.success) {
			throw new ValidationError('Invalid video id', [{ message: 'Invalid id', field: 'id' }]);
		}

		const body = updateVideoSchema.safeParse(req.body);
		if (!body.success) {
			const errors = buildValidationErrors(body.error.issues);
			throw new ValidationError('Validation failed', errors);
		}

		await updateVideo(params.data.id, body.data);
		sendNoContent(res);
	} catch (error: any) {
		if (error?.code === 'P2025') {
			return sendError(res, 'Video not found', 404, 'VIDEO_NOT_FOUND');
		}
		if (error instanceof ValidationError) {
			return sendError(res, error.message, error.statusCode, error.code, error.errors);
		}
		return sendError(res, 'Failed to update video');
	}
}

export async function handleDeleteVideo(req: Request, res: Response): Promise<void> {
	try {
		const params = videoIdParamSchema.safeParse(req.params);
		if (!params.success) {
			throw new ValidationError('Invalid video id', [{ message: 'Invalid id', field: 'id' }]);
		}
		await deleteVideo(params.data.id);
		sendNoContent(res);
	} catch (error: any) {
		if (error?.code === 'P2025') {
			return sendError(res, 'Video not found', 404, 'VIDEO_NOT_FOUND');
		}
		return sendError(res, 'Failed to delete video');
	}
}

export async function handleAttachVideoToCourse(req: Request, res: Response): Promise<void> {
	try {
		const paramsVideo = videoIdParamSchema.safeParse(req.params);
		if (!paramsVideo.success) {
			throw new ValidationError('Invalid video id', [{ message: 'Invalid id', field: 'id' }]);
		}

		const paramsCourse = courseIdParamSchema.safeParse({ id: req.params.courseId });
		if (!paramsCourse.success) {
			throw new ValidationError('Invalid course id', [{ message: 'Invalid id', field: 'courseId' }]);
		}

		const body = attachVideoToCourseSchema.safeParse(req.body);
		if (!body.success) {
			const errors = buildValidationErrors(body.error.issues);
			throw new ValidationError('Validation failed', errors);
		}

		await attachExistingVideoToCourse(paramsVideo.data.id, paramsCourse.data.id, body.data);
		sendNoContent(res);
	} catch (error: any) {
		if (error?.code === 'P2025') {
			return sendError(res, 'Video or Course not found', 404, 'NOT_FOUND');
		}
		if (error?.code === 'P2002') {
			return sendError(res, 'Video order must be unique within course', 409, 'VIDEO_ORDER_CONFLICT');
		}
		if (error instanceof ValidationError) {
			return sendError(res, error.message, error.statusCode, error.code, error.errors);
		}
		return sendError(res, 'Failed to attach video to course');
	}
}

export async function handleDetachVideoFromCourse(req: Request, res: Response): Promise<void> {
	try {
		const params = videoIdParamSchema.safeParse(req.params);
		if (!params.success) {
			throw new ValidationError('Invalid video id', [{ message: 'Invalid id', field: 'id' }]);
		}
		await detachVideoFromCourse(params.data.id);
		sendNoContent(res);
	} catch (error: any) {
		if (error?.code === 'P2025') {
			return sendError(res, 'Video not found', 404, 'VIDEO_NOT_FOUND');
		}
		return sendError(res, 'Failed to detach video from course');
	}
}
