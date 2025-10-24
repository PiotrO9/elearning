import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import {
	handleListVideos,
	handleGetVideoById,
	handleCreateVideo,
	handleUpdateVideo,
	handleDeleteVideo,
	handleAttachVideoToCourse,
	handleDetachVideoFromCourse,
} from '../controllers/videoController';

const router = Router();

/**
 * @route GET /api/video
 * @desc List all videos
 * @access Public
 */
router.get('/', handleListVideos);

/**
 * @route GET /api/video/:id
 * @desc Get video by id
 * @access Public
 */
router.get('/:id', handleGetVideoById);

/**
 * @route POST /api/video
 * @desc Create a new video
 * @access Admin only
 */
router.post('/', authenticateToken, requireAdmin, handleCreateVideo);

/**
 * @route PATCH /api/video/:id
 * @desc Update video
 * @access Admin only
 */
router.patch('/:id', authenticateToken, requireAdmin, handleUpdateVideo);

/**
 * @route DELETE /api/video/:id
 * @desc Delete video
 * @access Admin only
 */
router.delete('/:id', authenticateToken, requireAdmin, handleDeleteVideo);

/**
 * @route POST /api/video/:id/attach/:courseId
 * @desc Attach existing video to course
 * @access Admin only
 */
router.post('/:id/attach/:courseId', authenticateToken, requireAdmin, handleAttachVideoToCourse);

/**
 * @route POST /api/video/:id/detach
 * @desc Detach video from its course (deletes video)
 * @access Admin only
 */
router.post('/:id/detach', authenticateToken, requireAdmin, handleDetachVideoFromCourse);

export { router as videoRoutes };
