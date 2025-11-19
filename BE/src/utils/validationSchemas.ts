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
	isPublic: z.boolean().optional().default(false),
});

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
		isPublic: z.boolean().optional(),
	})
	.refine(obj => Object.keys(obj).length > 0, {
		message: 'At least one field must be provided',
	});

export const attachVideoToCourseSchema = z.object({
	order: z.number().int().positive().optional(),
	isTrailer: z.boolean().optional(),
});

export const reorderCourseVideosSchema = z.object({
	items: z
		.array(
			z.object({
				id: z.string().min(10, 'Invalid video id'),
				order: z.number().int().positive('Order must be positive'),
			}),
		)
		.min(1, 'At least one item is required'),
});

export const enrollUserSchema = z.object({
	userId: z.string().uuid('Invalid user id'),
});

export const userIdParamSchema = z.object({
	userId: z.string().uuid('Invalid user id'),
});

export const userRoleParamSchema = z.object({
	id: z.string().uuid('Invalid user id'),
});

export const updateUserRoleSchema = z.object({
	role: z.enum(['USER', 'ADMIN', 'SUPERADMIN'], {
		message: 'Role must be USER, ADMIN, or SUPERADMIN',
	}),
});

export const paginationQuerySchema = z.object({
	page: z.coerce.number().int().positive('Page must be a positive integer').default(1),
	limit: z.coerce
		.number()
		.int()
		.positive('Limit must be a positive integer')
		.max(100, 'Limit cannot exceed 100')
		.default(10),
	sortBy: z.string().optional(),
	sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
});

export const courseSortSchema = paginationQuerySchema.extend({
	sortBy: z
		.enum(['title', 'createdAt', 'updatedAt'], {
			message: 'sortBy must be one of: title, createdAt, updatedAt',
		})
		.optional()
		.default('createdAt'),
	tag: z.string().optional(),
});

export const videoSortSchema = paginationQuerySchema.extend({
	sortBy: z
		.enum(['title', 'order', 'createdAt', 'courseId'], {
			message: 'sortBy must be one of: title, order, createdAt, courseId',
		})
		.optional()
		.default('courseId'),
});

export const tagSortSchema = paginationQuerySchema.extend({
	sortBy: z
		.enum(['name', 'createdAt'], {
			message: 'sortBy must be one of: name, createdAt',
		})
		.optional()
		.default('name'),
});

export const enrollmentSortSchema = paginationQuerySchema.extend({
	sortBy: z
		.enum(['createdAt', 'username', 'email'], {
			message: 'sortBy must be one of: createdAt, username, email',
		})
		.optional()
		.default('createdAt'),
});

export const userCourseSortSchema = paginationQuerySchema.extend({
	sortBy: z
		.enum(['title', 'enrolledAt'], {
			message: 'sortBy must be one of: title, enrolledAt',
		})
		.optional()
		.default('enrolledAt'),
});
