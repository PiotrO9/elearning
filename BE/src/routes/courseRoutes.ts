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
import { validateBody, validateParams, validateQuery } from '../middleware/validation';
import { uploadCourseImage, handleUploadError } from '../middleware/upload';
import {
	courseIdParamSchema,
	createCourseSchema,
	updateCourseSchema,
	reorderCourseVideosSchema,
	courseSortSchema,
} from '../utils/validationSchemas';

const router = Router();

/**
 * @route GET /api/course
 * @query tag - Optional tag slug to filter courses (e.g., ?tag=javascript)
 * @desc List published courses, optionally filtered by tag
 * @access Public
 */
router.get('/', validateQuery(courseSortSchema), handleGetCourses);
/**
 * @route GET /api/course/:id
 * @desc Get course details (guests see trailer only)
 * @access Public
 */
router.get('/:id', validateParams(courseIdParamSchema), optionalAuth, handleGetCourseById);
/**
 * @route POST /api/course
 * @desc Create a new course (with optional image upload)
 * @access Admin only
 */
router.post(
	'/',
	authenticateToken,
	requireAdmin,
	uploadCourseImage,
	handleUploadError,
	validateBody(createCourseSchema),
	handleCreateCourse,
);
/**
 * @route DELETE /api/course/:id
 * @desc Delete a course
 * @access Admin only
 */
router.delete(
	'/:id',
	authenticateToken,
	requireAdmin,
	validateParams(courseIdParamSchema),
	handleDeleteCourse,
);

/**
 * @route PATCH /api/course/:id
 * @desc Update a course (with optional image upload)
 * @access Admin only
 */
router.patch(
	'/:id',
	authenticateToken,
	requireAdmin,
	validateParams(courseIdParamSchema),
	uploadCourseImage,
	handleUploadError,
	validateBody(updateCourseSchema),
	handleUpdateCourse,
);

/**
 * @route POST /api/course/:id/videos/reorder
 * @desc Reorder videos within a course
 * @access Admin only
 */
router.post(
	'/:id/videos/reorder',
	authenticateToken,
	requireAdmin,
	validateParams(courseIdParamSchema),
	validateBody(reorderCourseVideosSchema),
	handleReorderCourseVideos,
);

export { router as courseRoutes };
