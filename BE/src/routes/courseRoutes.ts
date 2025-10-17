import { Router } from 'express';
import {
	handleGetCourses,
	handleGetCourseById,
	handleCreateCourse,
	handleDeleteCourse,
} from '../controllers/courseController';
import { optionalAuth, authenticateToken } from '../middleware/auth';

const router = Router();

/**
 * @route GET /api/course
 * @desc List published courses
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
 * @access Private
 */
router.post('/', authenticateToken, handleCreateCourse);
/**
 * @route DELETE /api/course/:id
 * @desc Delete a course
 * @access Private
 */
router.delete('/:id', authenticateToken, handleDeleteCourse);

export { router as courseRoutes };
