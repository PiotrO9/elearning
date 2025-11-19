import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { validateBody, validateParams, validateQuery } from '../middleware/validation';
import {
	handleListVideos,
	handleGetVideoById,
	handleCreateVideo,
	handleUpdateVideo,
	handleDeleteVideo,
	handleAttachVideoToCourse,
	handleDetachVideoFromCourse,
} from '../controllers/videoController';
import { z } from 'zod';
import {
	createVideoSchema,
	updateVideoSchema,
	videoIdParamSchema,
	attachVideoToCourseSchema,
	videoSortSchema,
} from '../utils/validationSchemas';

const router = Router();

/**
 * @route GET /api/video
 * @desc List all videos
 * @access Public
 */
router.get('/', validateQuery(videoSortSchema), handleListVideos);

/**
 * @route GET /api/video/:id
 * @desc Get video by id
 * @access Public
 */
router.get('/:id', validateParams(videoIdParamSchema), handleGetVideoById);

/**
 * @route POST /api/video
 * @desc Create a new video
 * @access Admin only
 */
router.post('/', authenticateToken, requireAdmin, validateBody(createVideoSchema), handleCreateVideo);

/**
 * @route PATCH /api/video/:id
 * @desc Update video
 * @access Admin only
 */
router.patch(
	'/:id',
	authenticateToken,
	requireAdmin,
	validateParams(videoIdParamSchema),
	validateBody(updateVideoSchema),
	handleUpdateVideo,
);

/**
 * @route DELETE /api/video/:id
 * @desc Delete video
 * @access Admin only
 */
router.delete('/:id', authenticateToken, requireAdmin, validateParams(videoIdParamSchema), handleDeleteVideo);

/**
 * @route POST /api/video/:id/attach/:courseId
 * @desc Attach existing video to course
 * @access Admin only
 */
router.post(
	'/:id/attach/:courseId',
	authenticateToken,
	requireAdmin,
	validateParams(
		videoIdParamSchema.extend({
			courseId: z.string().min(10, 'Invalid course id'),
		}),
	),
	validateBody(attachVideoToCourseSchema),
	handleAttachVideoToCourse,
);

/**
 * @route POST /api/video/:id/detach
 * @desc Detach video from its course (deletes video)
 * @access Admin only
 */
router.post('/:id/detach', authenticateToken, requireAdmin, validateParams(videoIdParamSchema), handleDetachVideoFromCourse);

export { router as videoRoutes };
