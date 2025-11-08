import { Request, Response } from 'express';
import * as tagService from '../services/tagService';
import { CreateTagInput, UpdateTagInput } from '../types/tag';
import { sendSuccess, sendError } from '../utils/response';
import { PaginatedListResponse } from '../types/api';
import { buildPagination } from '../utils/pagination';
import { asyncHandler } from '../middleware/asyncHandler';

/**
 * Get all tags
 * GET /api/tags
 */
export const getAllTags = asyncHandler(async (req: Request, res: Response): Promise<void> => {
	const { page, limit, sortBy, sortOrder } = (req.query as any) as {
		page: number;
		limit: number;
		sortBy: string;
		sortOrder: 'asc' | 'desc';
	};
	const result = await tagService.getAllTags(page, limit, sortBy, sortOrder);

	const response: PaginatedListResponse<(typeof result.items)[0]> = {
		items: result.items,
		pagination: buildPagination(result.total, page, limit),
	};
	sendSuccess(res, response);
});

/**
 * Get tag by ID
 * GET /api/tags/:id
 */
export const getTagById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
	const { id } = req.params;

	const tag = await tagService.getTagById(id);

	if (!tag) {
		return sendError(res, 'Tag nie znaleziony', 404, 'TAG_NOT_FOUND');
	}

	sendSuccess(res, tag);
});

/**
 * Get tag by slug
 * GET /api/tags/slug/:slug
 */
export const getTagBySlug = asyncHandler(async (req: Request, res: Response): Promise<void> => {
	const { slug } = req.params;

	const tag = await tagService.getTagBySlug(slug);

	if (!tag) {
		return sendError(res, 'Tag nie znaleziony', 404, 'TAG_NOT_FOUND');
	}

	sendSuccess(res, tag);
});

/**
 * Create new tag (Admin only)
 * POST /api/tags
 */
export const createTag = asyncHandler(
	async (req: Request, res: Response): Promise<void> => {
		const input: CreateTagInput = req.body;

		if (!input.name || input.name.trim() === '') {
			return sendError(res, 'Nazwa tagu jest wymagana', 400, 'VALIDATION_ERROR');
		}

		const tag = await tagService.createTag(input);

		sendSuccess(res, tag, 'Tag został utworzony', 201);
	},
	(error: unknown, _req: Request, res: Response) => {
		if (error && typeof error === 'object' && 'message' in error) {
			const errorMessage = String((error as any).message);
			if (errorMessage.includes('już istnieje')) {
				sendError(res, errorMessage, 409, 'TAG_EXISTS');
				return true;
			}
		}
		return false;
	},
);

/**
 * Update tag (Admin only)
 * PATCH /api/tags/:id
 */
export const updateTag = asyncHandler(
	async (req: Request, res: Response): Promise<void> => {
		const { id } = req.params;
		const input: UpdateTagInput = req.body;

		if (!input.name && !input.slug && input.description === undefined) {
			return sendError(res, 'Przynajmniej jedno pole musi być podane', 400, 'VALIDATION_ERROR');
		}

		const tag = await tagService.updateTag(id, input);

		sendSuccess(res, tag, 'Tag został zaktualizowany');
	},
	(error: unknown, _req: Request, res: Response) => {
		if (error && typeof error === 'object' && 'message' in error) {
			const errorMessage = String((error as any).message);
			if (errorMessage === 'Tag nie istnieje') {
				sendError(res, errorMessage, 404, 'TAG_NOT_FOUND');
				return true;
			}
			if (errorMessage.includes('już istnieje')) {
				sendError(res, errorMessage, 409, 'TAG_EXISTS');
				return true;
			}
		}
		return false;
	},
);

/**
 * Delete tag (Admin only)
 * DELETE /api/tags/:id
 */
export const deleteTag = asyncHandler(
	async (req: Request, res: Response): Promise<void> => {
		const { id } = req.params;

		await tagService.deleteTag(id);

		sendSuccess(res, undefined, 'Tag został usunięty');
	},
	(error: unknown, _req: Request, res: Response) => {
		if (error && typeof error === 'object' && 'message' in error) {
			const errorMessage = String((error as any).message);
			if (errorMessage === 'Tag nie istnieje') {
				sendError(res, errorMessage, 404, 'TAG_NOT_FOUND');
				return true;
			}
		}
		return false;
	},
);

/**
 * Assign tags to course (Admin only)
 * PUT /api/tags/course/:courseId
 */
export const assignTagsToCourse = asyncHandler(
	async (req: Request, res: Response): Promise<void> => {
		const { courseId } = req.params;
		const { tagIds } = req.body;

		if (!Array.isArray(tagIds)) {
			return sendError(res, 'tagIds musi być tablicą', 400, 'VALIDATION_ERROR');
		}

		await tagService.assignTagsToCourse(courseId, tagIds);

		sendSuccess(res, undefined, 'Tagi zostały przypisane do kursu');
	},
	(error: unknown, _req: Request, res: Response) => {
		if (error && typeof error === 'object' && 'message' in error) {
			const errorMessage = String((error as any).message);
			if (errorMessage === 'Kurs nie istnieje' || errorMessage === 'Niektóre tagi nie istnieją') {
				sendError(res, errorMessage, 404, 'NOT_FOUND');
				return true;
			}
		}
		return false;
	},
);

/**
 * Add single tag to course (Admin only)
 * POST /api/tags/course/:courseId/tag/:tagId
 */
export const addTagToCourse = asyncHandler(
	async (req: Request, res: Response): Promise<void> => {
		const { courseId, tagId } = req.params;

		await tagService.addTagToCourse(courseId, tagId);

		sendSuccess(res, undefined, 'Tag został dodany do kursu');
	},
	(error: unknown, _req: Request, res: Response) => {
		if (error && typeof error === 'object' && 'message' in error) {
			const errorMessage = String((error as any).message);
			if (errorMessage === 'Kurs nie istnieje' || errorMessage === 'Tag nie istnieje') {
				sendError(res, errorMessage, 404, 'NOT_FOUND');
				return true;
			}
			if (errorMessage.includes('już przypisany')) {
				sendError(res, errorMessage, 409, 'TAG_ALREADY_ASSIGNED');
				return true;
			}
		}
		return false;
	},
);

/**
 * Remove tag from course (Admin only)
 * DELETE /api/tags/course/:courseId/tag/:tagId
 */
export const removeTagFromCourse = asyncHandler(
	async (req: Request, res: Response): Promise<void> => {
		const { courseId, tagId } = req.params;

		await tagService.removeTagFromCourse(courseId, tagId);

		sendSuccess(res, undefined, 'Tag został usunięty z kursu');
	},
	(error: unknown, _req: Request, res: Response) => {
		if (error && typeof error === 'object' && 'message' in error) {
			const errorMessage = String((error as any).message);
			if (errorMessage.includes('nie jest przypisany')) {
				sendError(res, errorMessage, 404, 'TAG_NOT_ASSIGNED');
				return true;
			}
		}
		return false;
	},
);

/**
 * Get tags for course
 * GET /api/tags/course/:courseId
 */
export const getTagsForCourse = asyncHandler(async (req: Request, res: Response): Promise<void> => {
	const { courseId } = req.params;

	const tags = await tagService.getTagsForCourse(courseId);

	const response: PaginatedListResponse<(typeof tags)[0]> = {
		items: tags,
		pagination: buildPagination(tags.length, 1, tags.length),
	};
	sendSuccess(res, response);
});
