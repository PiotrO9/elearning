import { Router } from 'express';
import { z } from 'zod';
import {
	handleEnrollUser,
	handleJoinCourse,
	handleUnenrollUser,
	handleGetCourseEnrollments,
	handleGetUserCourses,
} from '../controllers/enrollmentController';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { validateBody, validateParams, validateQuery } from '../middleware/validation';
import {
	enrollUserSchema,
	courseIdParamSchema,
	userIdParamSchema,
	enrollmentSortSchema,
	userCourseSortSchema,
} from '../utils/validationSchemas';

const router = Router();

/**
 * POST /courses/:id/enroll
 * Admin przypisuje użytkownika do kursu
 */
router.post(
	'/:id/enroll',
	authenticateToken,
	requireAdmin,
	validateParams(courseIdParamSchema),
	validateBody(enrollUserSchema),
	handleEnrollUser,
);

/**
 * POST /courses/:id/join
 * Użytkownik dołącza do publicznego kursu
 */
router.post('/:id/join', authenticateToken, validateParams(courseIdParamSchema), handleJoinCourse);

/**
 * DELETE /courses/:id/enrollments/:userId
 * Admin usuwa dostęp użytkownika do kursu
 */
router.delete(
	'/:id/enrollments/:userId',
	authenticateToken,
	requireAdmin,
	validateParams(
		courseIdParamSchema.extend({
			userId: z.string().uuid('Invalid user id'),
		}),
	),
	handleUnenrollUser,
);

/**
 * GET /courses/:id/enrollments
 * Pobiera listę użytkowników zapisanych na kurs (tylko admin)
 */
router.get(
	'/:id/enrollments',
	authenticateToken,
	requireAdmin,
	validateParams(courseIdParamSchema),
	validateQuery(enrollmentSortSchema),
	handleGetCourseEnrollments,
);

/**
 * GET /users/:userId/courses
 * Pobiera listę kursów użytkownika
 */
router.get(
	'/courses/users/:userId/courses',
	authenticateToken,
	validateParams(userIdParamSchema),
	validateQuery(userCourseSortSchema),
	handleGetUserCourses,
);

export default router;
