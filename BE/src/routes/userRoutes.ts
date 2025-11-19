import { Router } from 'express';
import { handleGetAllUsers, handleUpdateUserRole } from '../controllers/userController';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { validateBody, validateParams, validateQuery } from '../middleware/validation';
import {
	userRoleParamSchema,
	updateUserRoleSchema,
	userQuerySchema,
} from '../utils/validationSchemas';

const router = Router();

/**
 * @route GET /api/users
 * @desc Get all users with pagination
 * @access Admin or Superadmin
 */
router.get('/', authenticateToken, requireAdmin, validateQuery(userQuerySchema), handleGetAllUsers);

/**
 * @route PATCH /api/users/:id/role
 * @desc Update user role
 * @access Admin or Superadmin
 * @description
 * - ADMIN can change USER -> ADMIN
 * - SUPERADMIN can change ADMIN -> USER and USER -> ADMIN
 */
router.patch(
	'/:id/role',
	authenticateToken,
	requireAdmin,
	validateParams(userRoleParamSchema),
	validateBody(updateUserRoleSchema),
	handleUpdateUserRole,
);

export { router as userRoutes };
