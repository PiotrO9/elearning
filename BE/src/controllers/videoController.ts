import { Request, Response } from 'express';
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
} from '../services/videoService';

export async function handleCreateVideo(req: Request, res: Response): Promise<void> {
	try {
		const parsed = createVideoSchema.safeParse(req.body);
		if (!parsed.success) {
			res.status(400).json({
				success: false,
				message: 'Validation failed',
				details: parsed.error.issues.map(issue => ({
					field: issue.path.join('.'),
					message: issue.message,
				})),
			});
			return;
		}

		const id = await createVideo(parsed.data);
		res.status(201).json({ id });
	} catch (error: any) {
		if (error?.code === 'P2002') {
			res.status(409).json({ message: 'Video order must be unique within course' });
			return;
		}
		res.status(500).json({ message: 'Failed to create video' });
	}
}

export async function handleUpdateVideo(req: Request, res: Response): Promise<void> {
	try {
		const params = videoIdParamSchema.safeParse(req.params);
		if (!params.success) {
			res.status(400).json({ message: 'Invalid video id' });
			return;
		}

		const body = updateVideoSchema.safeParse(req.body);
		if (!body.success) {
			res.status(400).json({
				success: false,
				message: 'Validation failed',
				details: body.error.issues.map(issue => ({
					field: issue.path.join('.'),
					message: issue.message,
				})),
			});
			return;
		}

		await updateVideo(params.data.id, body.data);
		res.status(204).send();
	} catch (error: any) {
		if (error?.code === 'P2025') {
			res.status(404).json({ message: 'Video not found' });
			return;
		}
		res.status(500).json({ message: 'Failed to update video' });
	}
}

export async function handleDeleteVideo(req: Request, res: Response): Promise<void> {
	try {
		const params = videoIdParamSchema.safeParse(req.params);
		if (!params.success) {
			res.status(400).json({ message: 'Invalid video id' });
			return;
		}
		await deleteVideo(params.data.id);
		res.status(204).send();
	} catch (error: any) {
		if (error?.code === 'P2025') {
			res.status(404).json({ message: 'Video not found' });
			return;
		}
		res.status(500).json({ message: 'Failed to delete video' });
	}
}

export async function handleAttachVideoToCourse(req: Request, res: Response): Promise<void> {
	try {
		const paramsVideo = videoIdParamSchema.safeParse(req.params);
		if (!paramsVideo.success) {
			res.status(400).json({ message: 'Invalid video id' });
			return;
		}

		const paramsCourse = courseIdParamSchema.safeParse({ id: req.params.courseId });
		if (!paramsCourse.success) {
			res.status(400).json({ message: 'Invalid course id' });
			return;
		}

		const body = attachVideoToCourseSchema.safeParse(req.body);
		if (!body.success) {
			res.status(400).json({
				success: false,
				message: 'Validation failed',
				details: body.error.issues.map(issue => ({
					field: issue.path.join('.'),
					message: issue.message,
				})),
			});
			return;
		}

		await attachExistingVideoToCourse(paramsVideo.data.id, paramsCourse.data.id, body.data);
		res.status(204).send();
	} catch (error: any) {
		if (error?.code === 'P2025') {
			res.status(404).json({ message: 'Video or Course not found' });
			return;
		}
		if (error?.code === 'P2002') {
			res.status(409).json({ message: 'Video order must be unique within course' });
			return;
		}
		res.status(500).json({ message: 'Failed to attach video to course' });
	}
}

export async function handleDetachVideoFromCourse(req: Request, res: Response): Promise<void> {
	try {
		const params = videoIdParamSchema.safeParse(req.params);
		if (!params.success) {
			res.status(400).json({ message: 'Invalid video id' });
			return;
		}
		await detachVideoFromCourse(params.data.id);
		res.status(204).send();
	} catch (error: any) {
		if (error?.code === 'P2025') {
			res.status(404).json({ message: 'Video not found' });
			return;
		}
		res.status(500).json({ message: 'Failed to detach video from course' });
	}
}
