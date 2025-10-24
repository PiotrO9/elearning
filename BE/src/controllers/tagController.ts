import { Request, Response } from 'express';
import * as tagService from '../services/tagService';
import { CreateTagInput, UpdateTagInput } from '../types/tag';

/**
 * Get all tags
 * GET /api/tags
 */
export async function getAllTags(_req: Request, res: Response): Promise<void> {
	try {
		const tags = await tagService.getAllTags();

		res.status(200).json({
			success: true,
			data: tags,
		});
	} catch (error) {
		console.error('Error getting all tags:', error);
		res.status(500).json({
			success: false,
			message: 'Nie udało się pobrać tagów',
		});
	}
}

/**
 * Get tag by ID
 * GET /api/tags/:id
 */
export async function getTagById(req: Request, res: Response): Promise<void> {
	try {
		const { id } = req.params;

		const tag = await tagService.getTagById(id);

		if (!tag) {
			res.status(404).json({
				success: false,
				message: 'Tag nie znaleziony',
			});
			return;
		}

		res.status(200).json({
			success: true,
			data: tag,
		});
	} catch (error) {
		console.error('Error getting tag by ID:', error);
		res.status(500).json({
			success: false,
			message: 'Nie udało się pobrać tagu',
		});
	}
}

/**
 * Get tag by slug
 * GET /api/tags/slug/:slug
 */
export async function getTagBySlug(req: Request, res: Response): Promise<void> {
	try {
		const { slug } = req.params;

		const tag = await tagService.getTagBySlug(slug);

		if (!tag) {
			res.status(404).json({
				success: false,
				message: 'Tag nie znaleziony',
			});
			return;
		}

		res.status(200).json({
			success: true,
			data: tag,
		});
	} catch (error) {
		console.error('Error getting tag by slug:', error);
		res.status(500).json({
			success: false,
			message: 'Nie udało się pobrać tagu',
		});
	}
}

/**
 * Create new tag (Admin only)
 * POST /api/tags
 */
export async function createTag(req: Request, res: Response): Promise<void> {
	try {
		const input: CreateTagInput = req.body;

		// Validate input
		if (!input.name || input.name.trim() === '') {
			res.status(400).json({
				success: false,
				message: 'Nazwa tagu jest wymagana',
			});
			return;
		}

		const tag = await tagService.createTag(input);

		res.status(201).json({
			success: true,
			data: tag,
			message: 'Tag został utworzony',
		});
	} catch (error: any) {
		console.error('Error creating tag:', error);

		if (error.message?.includes('już istnieje')) {
			res.status(409).json({
				success: false,
				message: error.message,
			});
			return;
		}

		res.status(500).json({
			success: false,
			message: 'Nie udało się utworzyć tagu',
		});
	}
}

/**
 * Update tag (Admin only)
 * PATCH /api/tags/:id
 */
export async function updateTag(req: Request, res: Response): Promise<void> {
	try {
		const { id } = req.params;
		const input: UpdateTagInput = req.body;

		// Validate that at least one field is provided
		if (!input.name && !input.slug && input.description === undefined) {
			res.status(400).json({
				success: false,
				message: 'Przynajmniej jedno pole musi być podane',
			});
			return;
		}

		const tag = await tagService.updateTag(id, input);

		res.status(200).json({
			success: true,
			data: tag,
			message: 'Tag został zaktualizowany',
		});
	} catch (error: any) {
		console.error('Error updating tag:', error);

		if (error.message === 'Tag nie istnieje') {
			res.status(404).json({
				success: false,
				message: error.message,
			});
			return;
		}

		if (error.message?.includes('już istnieje')) {
			res.status(409).json({
				success: false,
				message: error.message,
			});
			return;
		}

		res.status(500).json({
			success: false,
			message: 'Nie udało się zaktualizować tagu',
		});
	}
}

/**
 * Delete tag (Admin only)
 * DELETE /api/tags/:id
 */
export async function deleteTag(req: Request, res: Response): Promise<void> {
	try {
		const { id } = req.params;

		await tagService.deleteTag(id);

		res.status(200).json({
			success: true,
			message: 'Tag został usunięty',
		});
	} catch (error: any) {
		console.error('Error deleting tag:', error);

		if (error.message === 'Tag nie istnieje') {
			res.status(404).json({
				success: false,
				message: error.message,
			});
			return;
		}

		res.status(500).json({
			success: false,
			message: 'Nie udało się usunąć tagu',
		});
	}
}

/**
 * Assign tags to course (Admin only)
 * PUT /api/tags/course/:courseId
 */
export async function assignTagsToCourse(req: Request, res: Response): Promise<void> {
	try {
		const { courseId } = req.params;
		const { tagIds } = req.body;

		// Validate input
		if (!Array.isArray(tagIds)) {
			res.status(400).json({
				success: false,
				message: 'tagIds musi być tablicą',
			});
			return;
		}

		await tagService.assignTagsToCourse(courseId, tagIds);

		res.status(200).json({
			success: true,
			message: 'Tagi zostały przypisane do kursu',
		});
	} catch (error: any) {
		console.error('Error assigning tags to course:', error);

		if (error.message === 'Kurs nie istnieje' || error.message === 'Niektóre tagi nie istnieją') {
			res.status(404).json({
				success: false,
				message: error.message,
			});
			return;
		}

		res.status(500).json({
			success: false,
			message: 'Nie udało się przypisać tagów do kursu',
		});
	}
}

/**
 * Add single tag to course (Admin only)
 * POST /api/tags/course/:courseId/tag/:tagId
 */
export async function addTagToCourse(req: Request, res: Response): Promise<void> {
	try {
		const { courseId, tagId } = req.params;

		await tagService.addTagToCourse(courseId, tagId);

		res.status(200).json({
			success: true,
			message: 'Tag został dodany do kursu',
		});
	} catch (error: any) {
		console.error('Error adding tag to course:', error);

		if (error.message === 'Kurs nie istnieje' || error.message === 'Tag nie istnieje') {
			res.status(404).json({
				success: false,
				message: error.message,
			});
			return;
		}

		if (error.message?.includes('już przypisany')) {
			res.status(409).json({
				success: false,
				message: error.message,
			});
			return;
		}

		res.status(500).json({
			success: false,
			message: 'Nie udało się dodać tagu do kursu',
		});
	}
}

/**
 * Remove tag from course (Admin only)
 * DELETE /api/tags/course/:courseId/tag/:tagId
 */
export async function removeTagFromCourse(req: Request, res: Response): Promise<void> {
	try {
		const { courseId, tagId } = req.params;

		await tagService.removeTagFromCourse(courseId, tagId);

		res.status(200).json({
			success: true,
			message: 'Tag został usunięty z kursu',
		});
	} catch (error: any) {
		console.error('Error removing tag from course:', error);

		if (error.message?.includes('nie jest przypisany')) {
			res.status(404).json({
				success: false,
				message: error.message,
			});
			return;
		}

		res.status(500).json({
			success: false,
			message: 'Nie udało się usunąć tagu z kursu',
		});
	}
}

/**
 * Get tags for course
 * GET /api/tags/course/:courseId
 */
export async function getTagsForCourse(req: Request, res: Response): Promise<void> {
	try {
		const { courseId } = req.params;

		const tags = await tagService.getTagsForCourse(courseId);

		res.status(200).json({
			success: true,
			data: tags,
		});
	} catch (error) {
		console.error('Error getting tags for course:', error);
		res.status(500).json({
			success: false,
			message: 'Nie udało się pobrać tagów kursu',
		});
	}
}
