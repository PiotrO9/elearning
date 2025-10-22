import { z } from 'zod';

export const registerSchema = z.object({
	email: z.string().email('Invalid email format'),
	username: z
		.string()
		.min(3, 'Username must be at least 3 characters')
		.max(30, 'Username must be less than 30 characters'),
	password: z
		.string()
		.min(6, 'Password must be at least 6 characters')
		.max(100, 'Password must be less than 100 characters'),
});

export const loginSchema = z.object({
	email: z.string().email('Invalid email format'),
	password: z.string().min(1, 'Password is required'),
});

export const courseIdParamSchema = z.object({
	id: z.string().min(10, 'Invalid course id'),
});

export const createCourseSchema = z.object({
	title: z.string().min(3, 'Title must be at least 3 characters').max(120, 'Title too long'),
	summary: z
		.string()
		.min(10, 'Summary must be at least 10 characters')
		.max(300, 'Summary must be less than 300 characters'),
	descriptionMarkdown: z.string().min(10, 'Description must be at least 10 characters'),
	imagePath: z.string().min(1, 'Image path is required'),
	isPublished: z.boolean().optional().default(true),
});

// Video and update schemas
export const videoIdParamSchema = z.object({
	id: z.string().min(10, 'Invalid video id'),
});

export const createVideoSchema = z.object({
	title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title too long'),
	order: z.number().int().positive('Order must be positive'),
	isTrailer: z.boolean().optional().default(false),
	sourceUrl: z.string().min(1, 'Source URL is required'),
	durationSeconds: z.number().int().nonnegative().optional(),
});

export const updateVideoSchema = z.object({
	courseId: z.string().min(10, 'Invalid course id').optional(),
	title: z
		.string()
		.min(3, 'Title must be at least 3 characters')
		.max(200, 'Title too long')
		.optional(),
	order: z.number().int().positive('Order must be positive').optional(),
	isTrailer: z.boolean().optional(),
	sourceUrl: z.string().min(1, 'Source URL is required').optional(),
	durationSeconds: z.number().int().nonnegative().optional(),
});

export const updateCourseSchema = z
	.object({
		title: z.string().min(3).max(120).optional(),
		summary: z.string().min(10).max(300).optional(),
		descriptionMarkdown: z.string().min(10).optional(),
		imagePath: z.string().min(1).optional(),
		isPublished: z.boolean().optional(),
	})
	.refine(obj => Object.keys(obj).length > 0, {
		message: 'At least one field must be provided',
	});

export const attachVideoToCourseSchema = z.object({
	order: z.number().int().positive().optional(),
	isTrailer: z.boolean().optional(),
});
