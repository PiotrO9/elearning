import { Request, Response } from 'express';
import { sendSuccess, sendNoContent, sendError, buildValidationErrors } from '../utils/response';
import { ValidationError } from '../types/api';
import {
	listPublishedCourses,
	getCourseDetail,
	createCourse,
	deleteCourse,
	updateCourse,
	reorderCourseVideos,
} from '../services/courseService';
import {
	courseIdParamSchema,
	createCourseSchema,
	updateCourseSchema,
	reorderCourseVideosSchema,
} from '../utils/validationSchemas';
import { CourseListItemDto, CourseDetailDto } from '../types/course';
import { VideoDto } from '../types/video';

export async function handleGetCourses(req: Request, res: Response): Promise<void> {
	req;
	try {
		const courses = await listPublishedCourses();
		const payload: CourseListItemDto[] = courses.map(c => ({
			id: c.id,
			title: c.title,
			description: c.summary,
			imagePath: c.imagePath,
		}));

		sendSuccess(res, { items: payload, total: payload.length });
	} catch (error) {
		sendError(res, 'Failed to fetch courses');
	}
}

export async function handleGetCourseById(req: Request, res: Response): Promise<void> {
	try {
		const parsed = courseIdParamSchema.safeParse(req.params);
		if (!parsed.success) {
			throw new ValidationError('Invalid course id', [{ message: 'Invalid id', field: 'id' }]);
		}
		const { id } = parsed.data;

		const isAuthenticated = Boolean(req.user?.userId);
		const course = await getCourseDetail(id, isAuthenticated);
		if (!course) {
			return sendError(res, 'Course not found', 404, 'COURSE_NOT_FOUND');
		}

		const payload: CourseDetailDto = {
			id: course.id,
			title: course.title,
			description: course.descriptionMarkdown,
			imagePath: course.imagePath,
			videos: course.videos.map(v => ({
				id: v.id,
				courseId: v.courseId,
				title: v.title,
				order: v.order,
				isTrailer: v.isTrailer,
				sourceUrl: v.sourceUrl,
				durationSeconds: v.durationSeconds,
			})) as VideoDto[],
		};

		sendSuccess(res, payload);
	} catch (error) {
		sendError(res, 'Failed to fetch course');
	}
}

export async function handleCreateCourse(req: Request, res: Response): Promise<void> {
	try {
		const parsed = createCourseSchema.safeParse(req.body);
		if (!parsed.success) {
			const errors = buildValidationErrors(parsed.error.issues);
			throw new ValidationError('Validation failed', errors);
		}

		const course = await createCourse(parsed.data);
		const payload: CourseDetailDto = {
			id: course.id,
			title: course.title,
			description: course.descriptionMarkdown,
			imagePath: course.imagePath,
			videos: course.videos.map(v => ({
				id: v.id,
				courseId: v.courseId,
				title: v.title,
				order: v.order,
				isTrailer: v.isTrailer,
				sourceUrl: v.sourceUrl,
				durationSeconds: v.durationSeconds,
			})) as VideoDto[],
		};

		sendSuccess(res, payload, 'Course created', 201);
	} catch (error) {
		sendError(res, 'Failed to create course');
	}
}

export async function handleDeleteCourse(req: Request, res: Response): Promise<void> {
	try {
		const parsed = courseIdParamSchema.safeParse(req.params);
		if (!parsed.success) {
			throw new ValidationError('Invalid course id', [{ message: 'Invalid id', field: 'id' }]);
		}

		const { id } = parsed.data;
		await deleteCourse(id);
		sendNoContent(res);
	} catch (error: any) {
		if (error?.code === 'P2025') {
			return sendError(res, 'Course not found', 404, 'COURSE_NOT_FOUND');
		}
		return sendError(res, 'Failed to delete course');
	}
}

export async function handleUpdateCourse(req: Request, res: Response): Promise<void> {
	try {
		const params = courseIdParamSchema.safeParse(req.params);
		if (!params.success) {
			throw new ValidationError('Invalid course id', [{ message: 'Invalid id', field: 'id' }]);
		}

		const body = updateCourseSchema.safeParse(req.body);
		if (!body.success) {
			const errors = buildValidationErrors(body.error.issues);
			throw new ValidationError('Validation failed', errors);
		}

		const course = await updateCourse(params.data.id, body.data);
		const payload: CourseDetailDto = {
			id: course.id,
			title: course.title,
			description: course.descriptionMarkdown,
			imagePath: course.imagePath,
			videos: course.videos.map(v => ({
				id: v.id,
				courseId: v.courseId,
				title: v.title,
				order: v.order,
				isTrailer: v.isTrailer,
				sourceUrl: v.sourceUrl,
				durationSeconds: v.durationSeconds,
			})) as VideoDto[],
		};

		sendSuccess(res, payload);
	} catch (error: any) {
		if (error?.code === 'P2025') {
			return sendError(res, 'Course not found', 404, 'COURSE_NOT_FOUND');
		}
		return sendError(res, 'Failed to update course');
	}
}

export async function handleReorderCourseVideos(req: Request, res: Response): Promise<void> {
	try {
		const params = courseIdParamSchema.safeParse(req.params);
		if (!params.success) {
			throw new ValidationError('Invalid course id', [{ message: 'Invalid id', field: 'id' }]);
		}

		const body = reorderCourseVideosSchema.safeParse(req.body);
		if (!body.success) {
			const errors = buildValidationErrors(body.error.issues);
			throw new ValidationError('Validation failed', errors);
		}

		await reorderCourseVideos(params.data.id, body.data.items);
		sendNoContent(res);
	} catch (error: any) {
		if (error?.code === 'VIDEO_NOT_IN_COURSE') {
			return sendError(res, 'Video not in course', 404, 'VIDEO_NOT_IN_COURSE');
		}
		if (error?.code === 'DUPLICATE_ORDER') {
			return sendError(res, 'Duplicate order values', 400, 'DUPLICATE_ORDER');
		}
		if (error instanceof ValidationError) {
			return sendError(res, error.message, error.statusCode, error.code, error.errors);
		}
		// Prisma unique constraint
		if (error?.code === 'P2002') {
			return sendError(res, 'Order must be unique within course', 409, 'VIDEO_ORDER_CONFLICT');
		}
		return sendError(res, 'Failed to reorder course videos');
	}
}
