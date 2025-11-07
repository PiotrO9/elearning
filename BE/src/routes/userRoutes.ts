import { Router } from 'express';
import { handleUpdateUserRole } from '../controllers/userController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

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

