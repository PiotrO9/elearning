import bcrypt from 'bcrypt';
import { prisma } from '../utils/prisma';
import {
	UserProfile,
	UpdateUserData,
	UpdatePasswordData,
	UpdateUserRoleData,
	PaginationParams,
	PaginatedUsersResponse,
	UserStatus,
	UserServiceError,
} from '../types/user';
import { UserRole } from '@prisma/client';

// use shared prisma instance

export class UserService {
	/**
	 * Gets user profile by ID
	 */
	async getUserProfile(userId: string): Promise<UserProfile> {
		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: {
				id: true,
				email: true,
				username: true,
				role: true,
				createdAt: true,
				updatedAt: true,
				lastSeen: true,
			},
		});

		if (!user) {
			throw new UserServiceError('User not found', 404, 'USER_NOT_FOUND');
		}

		return user;
	}

	/**
	 * Gets all users with pagination
	 */
	async getAllUsers(params: PaginationParams): Promise<PaginatedUsersResponse> {
		const { page, limit } = params;
		const skip = (page - 1) * limit;

		const users = await prisma.user.findMany({
			select: {
				id: true,
				email: true,
				username: true,
				role: true,
				createdAt: true,
				lastSeen: true,
			},
			skip,
			take: limit,
			orderBy: {
				createdAt: 'desc',
			},
		});

		const totalUsers = await prisma.user.count();
		const totalPages = Math.ceil(totalUsers / limit);

		return {
			users,
			pagination: {
				currentPage: page,
				totalPages,
				totalUsers,
				hasNext: page < totalPages,
				hasPrev: page > 1,
			},
		};
	}

	/**
	 * Updates user profile (username or email)
	 */
	async updateUserProfile(userId: string, data: UpdateUserData): Promise<UserProfile> {
		const { username, email } = data;

		if (!username && !email) {
			throw new UserServiceError(
				'At least one field (username or email) is required',
				400,
				'MISSING_FIELDS',
			);
		}

		const existingUser = await prisma.user.findUnique({
			where: { id: userId },
		});

		if (!existingUser) {
			throw new UserServiceError('User not found', 404, 'USER_NOT_FOUND');
		}

		if (email && email !== existingUser.email) {
			const emailExists = await prisma.user.findUnique({
				where: { email },
			});

			if (emailExists) {
				throw new UserServiceError('Email already in use', 400, 'EMAIL_IN_USE');
			}
		}

		if (username && username !== existingUser.username) {
			const usernameExists = await prisma.user.findUnique({
				where: { username },
			});

			if (usernameExists) {
				throw new UserServiceError('Username already in use', 400, 'USERNAME_IN_USE');
			}
		}

		const updatedUser = await prisma.user.update({
			where: { id: userId },
			data: {
				...(username && { username }),
				...(email && { email }),
				updatedAt: new Date(),
			},
			select: {
				id: true,
				email: true,
				username: true,
				role: true,
				createdAt: true,
				updatedAt: true,
				lastSeen: true,
			},
		});

		return updatedUser;
	}

	/**
	 * Soft deletes user (sets deletedAt)
	 */
	async deleteUser(userId: string): Promise<void> {
		const user = await prisma.user.findUnique({
			where: { id: userId },
		});

		if (!user) {
			throw new UserServiceError('User not found', 404, 'USER_NOT_FOUND');
		}

		await prisma.user.update({
			where: { id: userId },
			data: {
				deletedAt: new Date(),
			},
		});
	}

	/**
	 * Gets user online status
	 */
	async getUserStatus(userId: string): Promise<UserStatus> {
		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: {
				isOnline: true,
			},
		});

		if (!user) {
			throw new UserServiceError('User not found', 404, 'USER_NOT_FOUND');
		}

		return {
			status: user.isOnline ? 'online' : 'offline',
		};
	}

	/**
	 * Updates user password
	 */
	async updateUserPassword(userId: string, data: UpdatePasswordData): Promise<void> {
		const { currentPassword, newPassword } = data;

		if (currentPassword === newPassword) {
			throw new UserServiceError(
				'New password must be different from current password',
				400,
				'SAME_PASSWORD',
			);
		}

		const user = await prisma.user.findUnique({
			where: { id: userId },
		});

		if (!user) {
			throw new UserServiceError('User not found', 404, 'USER_NOT_FOUND');
		}

		const isMatch = await bcrypt.compare(currentPassword, user.password);
		if (!isMatch) {
			throw new UserServiceError('Current password is incorrect', 400, 'INCORRECT_PASSWORD');
		}

		const hashedNewPassword = await bcrypt.hash(newPassword, 12);

		await prisma.user.update({
			where: { id: userId },
			data: { password: hashedNewPassword },
		});
	}

	/**
	 * Sets user status to online
	 */
	async setUserOnline(userId: string): Promise<void> {
		await prisma.user.update({
			where: { id: userId },
			data: {
				isOnline: true,
				lastSeen: new Date(),
			},
		});
	}

	/**
	 * Sets user status to offline
	 */
	async setUserOffline(userId: string): Promise<void> {
		await prisma.user.update({
			where: { id: userId },
			data: {
				isOnline: false,
				lastSeen: new Date(),
			},
		});
	}

	/**
	 * Updates user role
	 * ADMIN can change USER -> ADMIN
	 * SUPERADMIN can change ADMIN -> USER and USER -> ADMIN
	 */
	async updateUserRole(
		userId: string,
		data: UpdateUserRoleData,
		requesterRole: UserRole,
	): Promise<UserProfile> {
		const { role: newRole } = data;

		const user = await prisma.user.findUnique({
			where: { id: userId },
		});

		if (!user) {
			throw new UserServiceError('User not found', 404, 'USER_NOT_FOUND');
		}

		// Check if role is being changed
		if (user.role === newRole) {
			throw new UserServiceError('User already has this role', 400, 'SAME_ROLE');
		}

		// Permission checks
		if (requesterRole === UserRole.ADMIN) {
			// ADMIN can only change USER -> ADMIN
			if (user.role !== UserRole.USER || newRole !== UserRole.ADMIN) {
				throw new UserServiceError(
					'Admin can only promote users from USER to ADMIN',
					403,
					'INSUFFICIENT_PERMISSIONS',
				);
			}
		} else if (requesterRole === UserRole.SUPERADMIN) {
			// SUPERADMIN can change ADMIN -> USER and USER -> ADMIN
			if (
				!(user.role === UserRole.USER && newRole === UserRole.ADMIN) &&
				!(user.role === UserRole.ADMIN && newRole === UserRole.USER)
			) {
				throw new UserServiceError(
					'Superadmin can only change USER <-> ADMIN roles',
					403,
					'INSUFFICIENT_PERMISSIONS',
				);
			}
		} else {
			throw new UserServiceError(
				'Only admin or superadmin can change user roles',
				403,
				'INSUFFICIENT_PERMISSIONS',
			);
		}

		const updatedUser = await prisma.user.update({
			where: { id: userId },
			data: {
				role: newRole,
				updatedAt: new Date(),
			},
			select: {
				id: true,
				email: true,
				username: true,
				role: true,
				createdAt: true,
				updatedAt: true,
				lastSeen: true,
			},
		});

		return updatedUser;
	}
}
