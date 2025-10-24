import { Request, Response } from 'express';
import { setAuthCookies, clearAuthCookies } from '../utils/jwt';
import { loginSchema, registerSchema } from '../utils/validationSchemas';
import {
	registerUser,
	loginUser,
	refreshAccessToken,
	logoutUser,
	getUserData,
} from '../services/authService';
import { AuthServiceError } from '../types/auth';
import { UserService } from '../services/userService';
import { sendSuccess, sendError, buildValidationErrors } from '../utils/response';
import { ValidationError } from '../types/api';

const userService = new UserService();

/**
 * Register new user
 * POST /api/auth/register
 */
export async function register(req: Request, res: Response): Promise<void> {
	try {
		const validationResult = registerSchema.safeParse(req.body);

		if (!validationResult.success) {
			const errors = buildValidationErrors(validationResult.error.issues);
			throw new ValidationError('Validation failed', errors);
		}

		const { email, username, password } = validationResult.data;

		await registerUser({ email, username, password });

		sendSuccess(res, undefined, 'User registered successfully', 201);
	} catch (error) {
		if (error instanceof AuthServiceError) {
			return sendError(res, error.message, error.statusCode, error.code);
		}

		console.error('Registration error:', error);
		return sendError(res, 'Internal server error');
	}
}

/**
 * Login user
 * POST /api/auth/login
 */
export async function login(req: Request, res: Response): Promise<void> {
	try {
		const validationResult = loginSchema.safeParse(req.body);

		if (!validationResult.success) {
			const errors = buildValidationErrors(validationResult.error.issues);
			throw new ValidationError('Validation failed', errors);
		}

		const { email, password } = validationResult.data;

		const result = await loginUser(email, password);

		setAuthCookies(res, result.accessToken, result.refreshToken);

		// Set user status to online
		try {
			await userService.setUserOnline(result.user.id);
		} catch (error) {
			console.error('Error setting user online status:', error);
		}

		sendSuccess(res, { user: result.user }, 'Login successful', 200);
	} catch (error) {
		if (error instanceof AuthServiceError) {
			return sendError(res, error.message, error.statusCode, error.code);
		}

		console.error('Login error:', error);
		return sendError(res, 'Internal server error');
	}
}

/**
 * Refresh access token
 * POST /api/auth/refresh
 */
export async function refresh(req: Request, res: Response): Promise<void> {
	try {
		const { refreshToken } = req.cookies;

		if (!refreshToken) {
			return sendError(res, 'Refresh token not found', 401, 'REFRESH_TOKEN_MISSING');
		}

		const newAccessToken = await refreshAccessToken(refreshToken);

		res.cookie('accessToken', newAccessToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict',
			maxAge: 15 * 60 * 1000, // 15 minutes
		});

		sendSuccess(res, undefined, 'Access token refreshed successfully', 200);
	} catch (error) {
		if (error instanceof AuthServiceError) {
			return sendError(res, error.message, error.statusCode, error.code);
		}

		console.error('Refresh token error:', error);
		return sendError(res, 'Internal server error');
	}
}

/**
 * Logout user
 * POST /api/auth/logout
 */
export async function logout(req: Request, res: Response): Promise<void> {
	try {
		const userId = (req as any).user?.userId;
		const { refreshToken } = req.cookies;

		if (refreshToken) {
			await logoutUser(refreshToken);
		}

		// Set user status to offline
		if (userId) {
			try {
				await userService.setUserOffline(userId);
			} catch (error) {
				console.error('Error setting user offline status:', error);
			}
		}

		clearAuthCookies(res);

		sendSuccess(res, undefined, 'Logout successful', 200);
	} catch (error) {
		console.error('Logout error:', error);
		return sendError(res, 'Internal server error');
	}
}

/**
 * Get current user data
 * GET /api/auth/me
 */
export async function me(req: Request, res: Response): Promise<void> {
	try {
		const userId = (req as any).user?.userId;

		if (!userId) {
			return sendError(res, 'User not authenticated', 401, 'UNAUTHENTICATED');
		}

		const user = await getUserData(userId);

		sendSuccess(res, { user }, undefined, 200);
	} catch (error) {
		if (error instanceof AuthServiceError) {
			return sendError(res, error.message, error.statusCode, error.code);
		}

		console.error('Get user data error:', error);
		return sendError(res, 'Internal server error');
	}
}
