import { Request, Response } from 'express';
import { sendSuccess } from '../utils/response';
import { asyncHandler } from '../middleware/asyncHandler';
import { UserService } from '../services/userService';
import { UserRole } from '@prisma/client';

const userService = new UserService();

/**
 * GET /users
 * Admin/Superadmin pobiera listę wszystkich użytkowników z paginacją
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
 * Admin/Superadmin zmienia rolę użytkownika
 * ADMIN może zmieniać USER -> ADMIN
 * SUPERADMIN może zmieniać ADMIN -> USER i USER -> ADMIN
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
