import { Request, Response } from 'express';
import { sendSuccess } from '../utils/response';
import { asyncHandler } from '../middleware/asyncHandler';
import { getDashboardData } from '../services/dashboardService';

/**
 * GET /api/admin/dashboard
 * Get dashboard data (metrics and recent activities)
 * Admin/Superadmin only
 */
export const handleGetDashboard = asyncHandler(
	async (_req: Request, res: Response): Promise<void> => {
		const data = await getDashboardData();
		sendSuccess(res, data, 'Dashboard data retrieved successfully');
	},
);

