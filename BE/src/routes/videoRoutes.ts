import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
	handleCreateVideo,
	handleUpdateVideo,
	handleDeleteVideo,
	handleAttachVideoToCourse,
	handleDetachVideoFromCourse,
} from '../controllers/videoController';

const router = Router();

/**
 * @route POST /api/video
 * @desc Create a new video
 * @access Private
 */
router.post('/', authenticateToken, handleCreateVideo);

/**
 * @route PATCH /api/video/:id
 * @desc Update video
 * @access Private
 */
router.patch('/:id', authenticateToken, handleUpdateVideo);

/**
 * @route DELETE /api/video/:id
 * @desc Delete video
 * @access Private
 */
router.delete('/:id', authenticateToken, handleDeleteVideo);

/**
 * @route POST /api/video/:id/attach/:courseId
 * @desc Attach existing video to course
 * @access Private
 */
router.post('/:id/attach/:courseId', authenticateToken, handleAttachVideoToCourse);

/**
 * @route POST /api/video/:id/detach
 * @desc Detach video from its course (deletes video)
 * @access Private
 */
router.post('/:id/detach', authenticateToken, handleDetachVideoFromCourse);

export { router as videoRoutes };
