import bcrypt from 'bcrypt';
import { prisma } from '../utils/prisma';
import {
	generateAccessToken,
	generateRefreshToken,
	verifyRefreshToken,
	TokenPayload,
} from '../utils/jwt';
import { RegisterUserData, LoginResult, UserData, AuthServiceError } from '../types/auth';

/**
 * Register new user
 */
export async function registerUser(data: RegisterUserData): Promise<void> {
	const { email, username, password } = data;

	const existingUser = await prisma.user.findFirst({
		where: {
			OR: [{ email }, { username }],
			deletedAt: null,
		},
	});

	if (existingUser) {
		throw new AuthServiceError('User with this email or username already exists', 409, 'USER_EXISTS');
	}

	const saltRounds = 12;
	const hashedPassword = await bcrypt.hash(password, saltRounds);

	await prisma.user.create({
		data: {
			email,
			username,
			password: hashedPassword,
		},
	});
}

/**
 * Login user
 */
export async function loginUser(email: string, password: string): Promise<LoginResult> {
	const user = await prisma.user.findUnique({
		where: { email },
	});

	if (!user) {
		throw new AuthServiceError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
	}

	if (user.deletedAt !== null) {
		throw new AuthServiceError('This account has been deleted', 403, 'ACCOUNT_DELETED');
	}

	const isPasswordValid = await bcrypt.compare(password, user.password);

	if (!isPasswordValid) {
		throw new AuthServiceError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
	}

	const tokenPayload: TokenPayload = {
		userId: user.id,
		email: user.email,
		role: user.role,
	};

	const accessToken = generateAccessToken(tokenPayload);
	const refreshToken = generateRefreshToken(tokenPayload);

	await prisma.refreshToken.create({
		data: {
			token: refreshToken,
			userId: user.id,
			expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
		},
	});

	await prisma.user.update({
		where: { id: user.id },
		data: { lastSeen: new Date() },
	});

	return {
		user: {
			id: user.id,
			username: user.username,
			email: user.email,
		},
		accessToken,
		refreshToken,
	};
}

/**
 * Refresh access token
 */
export async function refreshAccessToken(refreshToken: string): Promise<string> {
	try {
		verifyRefreshToken(refreshToken);
	} catch (error) {
		throw new AuthServiceError('Invalid refresh token', 401, 'INVALID_TOKEN');
	}

	const storedToken = await prisma.refreshToken.findUnique({
		where: { token: refreshToken },
		include: { user: true },
	});

	if (!storedToken || storedToken.expiresAt < new Date()) {
		throw new AuthServiceError('Refresh token expired or not found', 401, 'TOKEN_EXPIRED');
	}

	if (storedToken.user.deletedAt !== null) {
		await prisma.refreshToken.delete({
			where: { token: refreshToken },
		});
		throw new AuthServiceError('This account has been deleted', 403, 'ACCOUNT_DELETED');
	}

	const newAccessToken = generateAccessToken({
		userId: storedToken.user.id,
		email: storedToken.user.email,
		role: storedToken.user.role,
	});

	return newAccessToken;
}

/**
 * Logout user
 */
export async function logoutUser(refreshToken: string): Promise<void> {
	await prisma.refreshToken.deleteMany({
		where: { token: refreshToken },
	});
}

/**
 * Get user data
 */
export async function getUserData(userId: string): Promise<UserData> {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: {
			id: true,
			email: true,
			username: true,
			createdAt: true,
			role: true,
			lastSeen: true,
			deletedAt: true,
		},
	});

	if (!user) {
		throw new AuthServiceError('User not found', 404, 'USER_NOT_FOUND');
	}

	if (user.deletedAt !== null) {
		throw new AuthServiceError('This account has been deleted', 403, 'ACCOUNT_DELETED');
	}

	const { deletedAt, ...userData } = user;

	return userData;
}
