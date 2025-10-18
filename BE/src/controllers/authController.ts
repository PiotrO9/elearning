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

const userService = new UserService();

/**
 * Register new user
 * POST /api/auth/register
 */
export async function register(req: Request, res: Response): Promise<void> {
	try {
		const validationResult = registerSchema.safeParse(req.body);

		if (!validationResult.success) {
			res.status(400).json({
				success: false,
				message: 'Validation failed',
				details: validationResult.error.issues.map(issue => ({
					field: issue.path.join('.'),
					message: issue.message,
				})),
			});
			return;
		}

		const { email, username, password } = validationResult.data;

		await registerUser({ email, username, password });

		res.status(201).json({
			success: true,
			message: 'User registered successfully',
		});
	} catch (error) {
		if (error instanceof AuthServiceError) {
			res.status(error.statusCode).json({
				success: false,
				message: error.message,
			});
			return;
		}

		console.error('Registration error:', error);
		res.status(500).json({
			success: false,
			message: 'Internal server error',
		});
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
			res.status(400).json({
				success: false,
				message: 'Validation failed',
				details: validationResult.error.issues.map(issue => ({
					field: issue.path.join('.'),
					message: issue.message,
				})),
			});
			return;
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

		res.status(200).json({
			success: true,
			message: 'Login successful',
			data: {
				user: result.user,
			},
		});
	} catch (error) {
		if (error instanceof AuthServiceError) {
			res.status(error.statusCode).json({
				success: false,
				message: error.message,
			});
			return;
		}

		console.error('Login error:', error);
		res.status(500).json({
			success: false,
			message: 'Internal server error',
		});
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
			res.status(401).json({
				success: false,
				message: 'Refresh token not found',
			});
			return;
		}

		const newAccessToken = await refreshAccessToken(refreshToken);

		res.cookie('accessToken', newAccessToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict',
			maxAge: 15 * 60 * 1000, // 15 minutes
		});

		res.status(200).json({
			success: true,
			message: 'Access token refreshed successfully',
		});
	} catch (error) {
		if (error instanceof AuthServiceError) {
			res.status(error.statusCode).json({
				success: false,
				message: error.message,
			});
			return;
		}

		console.error('Refresh token error:', error);
		res.status(500).json({
			success: false,
			message: 'Internal server error',
		});
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

		res.status(200).json({
			success: true,
			message: 'Logout successful',
		});
	} catch (error) {
		console.error('Logout error:', error);
		res.status(500).json({
			success: false,
			message: 'Internal server error',
		});
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
			res.status(401).json({
				success: false,
				message: 'User not authenticated',
			});
			return;
		}

		const user = await getUserData(userId);

		res.status(200).json({
			success: true,
			data: {
				user,
			},
		});
	} catch (error) {
		if (error instanceof AuthServiceError) {
			res.status(error.statusCode).json({
				success: false,
				message: error.message,
			});
			return;
		}

		console.error('Get user data error:', error);
		res.status(500).json({
			success: false,
			message: 'Internal server error',
		});
	}
}
