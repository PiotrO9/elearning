import { Request, Response } from 'express';
import {
	listPublishedCourses,
	getCourseDetail,
	createCourse,
	deleteCourse,
	updateCourse,
} from '../services/courseService';
import {
	courseIdParamSchema,
	createCourseSchema,
	updateCourseSchema,
} from '../utils/validationSchemas';
import { CourseListItemDto, CourseDetailDto } from '../types/course';

export async function handleGetCourses(req: Request, res: Response): Promise<void> {
	req;
	try {
		const courses = await listPublishedCourses();
		const payload: CourseListItemDto[] = courses.map(c => ({
			id: c.id,
			title: c.title,
			description: c.summary,
			image_path: c.imagePath,
		}));

		res.json(payload);
	} catch (error) {
		res.status(500).json({ message: 'Failed to fetch courses' });
	}
}

export async function handleGetCourseById(req: Request, res: Response): Promise<void> {
	try {
		const parsed = courseIdParamSchema.safeParse(req.params);
		if (!parsed.success) {
			res.status(400).json({ message: 'Invalid course id' });
			return;
		}
		const { id } = parsed.data;

		const isAuthenticated = Boolean(req.user?.userId);
		const course = await getCourseDetail(id, isAuthenticated);
		if (!course) {
			res.status(404).json({ message: 'Course not found' });
			return;
		}

		const payload: CourseDetailDto = {
			id: course.id,
			title: course.title,
			description: course.descriptionMarkdown,
			image_path: course.imagePath,
			videos: course.videoIds,
		};

		res.json(payload);
	} catch (error) {
		res.status(500).json({ message: 'Failed to fetch course' });
	}
}

export async function handleCreateCourse(req: Request, res: Response): Promise<void> {
	try {
		const parsed = createCourseSchema.safeParse(req.body);
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

		const course = await createCourse(parsed.data);
		const payload: CourseDetailDto = {
			id: course.id,
			title: course.title,
			description: course.descriptionMarkdown,
			image_path: course.imagePath,
			videos: course.videoIds,
		};

		res.status(201).json(payload);
	} catch (error) {
		res.status(500).json({ message: 'Failed to create course' });
	}
}

export async function handleDeleteCourse(req: Request, res: Response): Promise<void> {
	try {
		const parsed = courseIdParamSchema.safeParse(req.params);
		if (!parsed.success) {
			res.status(400).json({ message: 'Invalid course id' });
			return;
		}

		const { id } = parsed.data;
		await deleteCourse(id);
		res.status(204).send();
	} catch (error: any) {
		if (error?.code === 'P2025') {
			res.status(404).json({ message: 'Course not found' });
			return;
		}
		res.status(500).json({ message: 'Failed to delete course' });
	}
}

export async function handleUpdateCourse(req: Request, res: Response): Promise<void> {
	try {
		const params = courseIdParamSchema.safeParse(req.params);
		if (!params.success) {
			res.status(400).json({ message: 'Invalid course id' });
			return;
		}

		const body = updateCourseSchema.safeParse(req.body);
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

		const course = await updateCourse(params.data.id, body.data);
		const payload: CourseDetailDto = {
			id: course.id,
			title: course.title,
			description: course.descriptionMarkdown,
			image_path: course.imagePath,
			videos: course.videoIds,
		};

		res.json(payload);
	} catch (error: any) {
		if (error?.code === 'P2025') {
			res.status(404).json({ message: 'Course not found' });
			return;
		}
		res.status(500).json({ message: 'Failed to update course' });
	}
}
