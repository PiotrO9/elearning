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

// cuid-like string (cuid2 or cuid) – for simplicity accept 10+ chars alphanumeric
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
