import { Router } from 'express';
import {
	handleEnrollUser,
	handleJoinCourse,
	handleUnenrollUser,
	handleGetCourseEnrollments,
	handleGetUserCourses,
} from '../controllers/enrollmentController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

/**
 * POST /courses/:id/enroll
 * Admin przypisuje użytkownika do kursu
 */
router.post('/:id/enroll', authenticateToken, requireAdmin, handleEnrollUser);

/**
 * POST /courses/:id/join
 * Użytkownik dołącza do publicznego kursu
 */
router.post('/:id/join', authenticateToken, handleJoinCourse);

/**
 * DELETE /courses/:id/enrollments/:userId
 * Admin usuwa dostęp użytkownika do kursu
 */
router.delete('/:id/enrollments/:userId', authenticateToken, requireAdmin, handleUnenrollUser);

/**
 * GET /courses/:id/enrollments
 * Pobiera listę użytkowników zapisanych na kurs (tylko admin)
 */
router.get('/:id/enrollments', authenticateToken, requireAdmin, handleGetCourseEnrollments);

/**
 * GET /users/:userId/courses
 * Pobiera listę kursów użytkownika
 */
router.get('/courses/users/:userId/courses', authenticateToken, handleGetUserCourses);

export default router;
