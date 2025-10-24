import { Router } from 'express';
import * as tagController from '../controllers/tagController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/', tagController.getAllTags);
router.get('/slug/:slug', tagController.getTagBySlug);
router.get('/:id', tagController.getTagById);
router.get('/course/:courseId', tagController.getTagsForCourse);

router.post('/', authenticateToken, requireAdmin, tagController.createTag);
router.patch('/:id', authenticateToken, requireAdmin, tagController.updateTag);
router.delete('/:id', authenticateToken, requireAdmin, tagController.deleteTag);

router.put('/course/:courseId', authenticateToken, requireAdmin, tagController.assignTagsToCourse);
router.post(
	'/course/:courseId/tag/:tagId',
	authenticateToken,
	requireAdmin,
	tagController.addTagToCourse,
);
router.delete(
	'/course/:courseId/tag/:tagId',
	authenticateToken,
	requireAdmin,
	tagController.removeTagFromCourse,
);

export default router;
