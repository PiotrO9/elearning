import { UserRole } from '@prisma/client';

export { UserRole };

export interface UserProfile {
	id: string;
	email: string;
	username: string;
	role: UserRole;
	createdAt: Date;
	updatedAt: Date;
	lastSeen: Date | null;
}

export interface UserBasic {
	id: string;
	email: string;
	username: string;
	role: UserRole;
	createdAt: Date;
	lastSeen: Date | null;
	coursesCount: number;
}

export interface UpdateUserData {
	username?: string;
	email?: string;
}

export interface UpdatePasswordData {
	currentPassword: string;
	newPassword: string;
}

export interface UpdateUserRoleData {
	role: UserRole;
}

export interface PaginationParams {
	page: number;
	limit: number;
}

export interface PaginatedUsersResponse {
	users: UserBasic[];
	pagination: {
		currentPage: number;
		totalPages: number;
		totalUsers: number;
		hasNext: boolean;
		hasPrev: boolean;
	};
}

export interface UserStatus {
	status: 'online' | 'offline';
}

export class UserServiceError extends Error {
	constructor(message: string, public statusCode: number, public code?: string) {
		super(message);
		this.name = 'UserServiceError';
	}
}
