import { Request, Response } from 'express';
import { setAuthCookies, clearAuthCookies } from '../utils/jwt';
import {
	registerUser,
	loginUser,
	refreshAccessToken,
	logoutUser,
	getUserData,
} from '../services/authService';
import { UserService } from '../services/userService';
import { sendSuccess, sendError } from '../utils/response';
import { asyncHandler } from '../middleware/asyncHandler';

const userService = new UserService();

/**
 * Register new user
 * POST /api/auth/register
 */
export const register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
	const { email, username, password } = req.body as {
		email: string;
		username: string;
		password: string;
	};

	await registerUser({ email, username, password });

	sendSuccess(res, undefined, 'User registered successfully', 201);
});

/**
 * Login user
 * POST /api/auth/login
 */
export const login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
	const { email, password } = req.body as { email: string; password: string };

	const result = await loginUser(email, password);

	setAuthCookies(res, result.accessToken, result.refreshToken);

	// Set user status to online (ignore errors)
	try {
		await userService.setUserOnline(result.user.id);
	} catch (error) {
		console.error('Error setting user online status:', error);
	}

	sendSuccess(res, { user: result.user }, 'Login successful', 200);
});

/**
 * Refresh access token
 * POST /api/auth/refresh
 */
export const refresh = asyncHandler(async (req: Request, res: Response): Promise<void> => {
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
});

/**
 * Logout user
 * POST /api/auth/logout
 */
export const logout = asyncHandler(async (req: Request, res: Response): Promise<void> => {
	const userId = (req as any).user?.userId;
	const { refreshToken } = req.cookies;

	if (refreshToken) {
		await logoutUser(refreshToken);
	}

	// Set user status to offline (ignore errors)
	if (userId) {
		try {
			await userService.setUserOffline(userId);
		} catch (error) {
			console.error('Error setting user offline status:', error);
		}
	}

	clearAuthCookies(res);

	sendSuccess(res, undefined, 'Logout successful', 200);
});

/**
 * Get current user data
 * GET /api/auth/me
 */
export const me = asyncHandler(async (req: Request, res: Response): Promise<void> => {
	const userId = (req as any).user?.userId;

	if (!userId) {
		return sendError(res, 'User not authenticated', 401, 'UNAUTHENTICATED');
	}

	const user = await getUserData(userId);

	sendSuccess(res, { user }, undefined, 200);
});
