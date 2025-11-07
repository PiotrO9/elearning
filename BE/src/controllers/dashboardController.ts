import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/response';
import { getDashboardData } from '../services/dashboardService';

/**
 * GET /api/admin/dashboard
 * Get dashboard data (metrics and recent activities)
 * Admin/Superadmin only
 */
export async function handleGetDashboard(_req: Request, res: Response): Promise<void> {
	try {
		const data = await getDashboardData();
		sendSuccess(res, data, 'Dashboard data retrieved successfully');
	} catch (error) {
		console.error('Error getting dashboard data:', error);
		sendError(res, 'Failed to fetch dashboard data');
	}
}

