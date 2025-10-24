import { Router } from 'express';
import {
	handleGetCourses,
	handleGetCourseById,
	handleCreateCourse,
	handleDeleteCourse,
	handleUpdateCourse,
	handleReorderCourseVideos,
} from '../controllers/courseController';
import { optionalAuth, authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

/**
 * @route GET /api/course
 * @query tag - Optional tag slug to filter courses (e.g., ?tag=javascript)
 * @desc List published courses, optionally filtered by tag
 * @access Public
 */
router.get('/', handleGetCourses);
/**
 * @route GET /api/course/:id
 * @desc Get course details (guests see trailer only)
 * @access Public
 */
router.get('/:id', optionalAuth, handleGetCourseById);
/**
 * @route POST /api/course
 * @desc Create a new course
 * @access Admin only
 */
router.post('/', authenticateToken, requireAdmin, handleCreateCourse);
/**
 * @route DELETE /api/course/:id
 * @desc Delete a course
 * @access Admin only
 */
router.delete('/:id', authenticateToken, requireAdmin, handleDeleteCourse);

/**
 * @route PATCH /api/course/:id
 * @desc Update a course
 * @access Admin only
 */
router.patch('/:id', authenticateToken, requireAdmin, handleUpdateCourse);

/**
 * @route POST /api/course/:id/videos/reorder
 * @desc Reorder videos within a course
 * @access Admin only
 */
router.post('/:id/videos/reorder', authenticateToken, requireAdmin, handleReorderCourseVideos);

export { router as courseRoutes };
