import { Router } from 'express';
import { handleGetDashboard } from '../controllers/dashboardController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

/**
 * @route GET /api/admin/dashboard
 * @desc Get dashboard data (metrics and recent activities)
 * @access Admin or Superadmin
 */
router.get('/', authenticateToken, requireAdmin, handleGetDashboard);

export { router as dashboardRoutes };

