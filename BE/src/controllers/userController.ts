import { Request, Response } from 'express';
import { sendSuccess } from '../utils/response';
import { asyncHandler } from '../middleware/asyncHandler';
import { UserService } from '../services/userService';
import { UserRole } from '@prisma/client';

const userService = new UserService();

/**
 * GET /users
 * Admin/Superadmin gets list of all users with pagination
 */
export const handleGetAllUsers = asyncHandler(
	async (req: Request, res: Response): Promise<void> => {
		const { page, limit } = req.query as any as { page: number; limit: number };
		const result = await userService.getAllUsers({ page, limit });

		sendSuccess(res, result, 'Users retrieved successfully', 200);
	},
);

/**
 * PATCH /users/:id/role
 * Admin/Superadmin changes user role
 * ADMIN can change USER -> ADMIN
 * SUPERADMIN can change ADMIN -> USER and USER -> ADMIN
 */
export const handleUpdateUserRole = asyncHandler(
	async (req: Request, res: Response): Promise<void> => {
		const { id: userId } = req.params as any as { id: string };
		const { role } = req.body as { role: UserRole };
		const requesterRole = req.user!.role as UserRole;

		const updatedUser = await userService.updateUserRole(userId, { role }, requesterRole);

		sendSuccess(res, { user: updatedUser }, 'User role updated successfully', 200);
	},
);
