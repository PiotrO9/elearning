import { Router } from 'express';
import { handleGetAllUsers, handleUpdateUserRole } from '../controllers/userController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

/**
 * @route GET /api/users
 * @desc Get all users with pagination
 * @access Admin or Superadmin
 */
router.get('/', authenticateToken, requireAdmin, handleGetAllUsers);

/**
 * @route PATCH /api/users/:id/role
 * @desc Update user role
 * @access Admin or Superadmin
 * @description
 * - ADMIN can change USER -> ADMIN
 * - SUPERADMIN can change ADMIN -> USER and USER -> ADMIN
 */
router.patch('/:id/role', authenticateToken, requireAdmin, handleUpdateUserRole);

export { router as userRoutes };

