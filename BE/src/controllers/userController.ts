import { Request, Response } from 'express';
import { sendSuccess, sendError, buildValidationErrors } from '../utils/response';
import { ValidationError } from '../types/api';
import { UserService } from '../services/userService';
import { UserServiceError } from '../types/user';
import {
	userRoleParamSchema,
	updateUserRoleSchema,
	paginationQuerySchema,
} from '../utils/validationSchemas';
import { UserRole } from '@prisma/client';

const userService = new UserService();

/**
 * GET /users
 * Admin/Superadmin pobiera listę wszystkich użytkowników z paginacją
 */
export async function handleGetAllUsers(req: Request, res: Response): Promise<void> {
	try {
		const queryValidation = paginationQuerySchema.safeParse(req.query);
		if (!queryValidation.success) {
			const errors = buildValidationErrors(queryValidation.error.issues);
			throw new ValidationError('Invalid pagination parameters', errors);
		}

		const { page, limit } = queryValidation.data;
		const result = await userService.getAllUsers({ page, limit });

		sendSuccess(res, result, 'Users retrieved successfully', 200);
	} catch (error) {
		if (error instanceof UserServiceError) {
			return sendError(res, error.message, error.statusCode, error.code);
		}
		if (error instanceof ValidationError) {
			return sendError(res, error.message, error.statusCode, error.code, error.errors);
		}
		return sendError(res, 'Failed to retrieve users');
	}
}

/**
 * PATCH /users/:id/role
 * Admin/Superadmin zmienia rolę użytkownika
 * ADMIN może zmieniać USER -> ADMIN
 * SUPERADMIN może zmieniać ADMIN -> USER i USER -> ADMIN
 */
export async function handleUpdateUserRole(req: Request, res: Response): Promise<void> {
	try {
		const paramsValidation = userRoleParamSchema.safeParse(req.params);
		if (!paramsValidation.success) {
			const errors = buildValidationErrors(paramsValidation.error.issues);
			throw new ValidationError('Invalid user id', errors);
		}

		const bodyValidation = updateUserRoleSchema.safeParse(req.body);
		if (!bodyValidation.success) {
			const errors = buildValidationErrors(bodyValidation.error.issues);
			throw new ValidationError('Validation failed', errors);
		}

		const { id: userId } = paramsValidation.data;
		const { role } = bodyValidation.data;
		const requesterRole = req.user!.role as UserRole;

		const updatedUser = await userService.updateUserRole(userId, { role }, requesterRole);

		sendSuccess(res, { user: updatedUser }, 'User role updated successfully', 200);
	} catch (error) {
		if (error instanceof UserServiceError) {
			return sendError(res, error.message, error.statusCode, error.code);
		}
		if (error instanceof ValidationError) {
			return sendError(res, error.message, error.statusCode, error.code, error.errors);
		}
		return sendError(res, 'Failed to update user role');
	}
}
