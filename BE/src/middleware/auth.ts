import { Request, Response, NextFunction } from 'express';
import {
	verifyAccessToken,
	TokenPayload,
	generateAccessToken,
	SLIDING_SESSION_ENABLED,
} from '../utils/jwt';

declare global {
	namespace Express {
		interface Request {
			user?: TokenPayload;
		}
	}
}

/**
 * Middleware to authenticate user using JWT from cookies
 * Automatically refreshes access token on successful authentication (sliding session)
 */
export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
	try {
		const { accessToken } = req.cookies;

		if (!accessToken) {
			res.status(401).json({
				success: false,
				message: 'Access token required',
			});
			return;
		}

		// Verify access token
		const decoded = verifyAccessToken(accessToken);
		req.user = decoded;

		// Generate new access token with refreshed expiration (sliding session)
		if (SLIDING_SESSION_ENABLED) {
			const newAccessToken = generateAccessToken({
				userId: decoded.userId,
				email: decoded.email,
			});

			// Set refreshed access token cookie
			res.cookie('accessToken', newAccessToken, {
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'strict',
				maxAge: 15 * 60 * 1000, // 15 minutes refreshed
			});

			// Optional: Add header to indicate token was refreshed
			res.setHeader('X-Token-Refreshed', 'true');
		}

		next();
	} catch (error) {
		res.status(403).json({
			success: false,
			message: 'Invalid or expired access token',
		});
	}
};

/**
 * Middleware to authenticate user using JWT from cookies
 * WITHOUT automatic token refresh (for endpoints where you don't want sliding session)
 */
export const authenticateTokenWithoutRefresh = (
	req: Request,
	res: Response,
	next: NextFunction,
): void => {
	try {
		const { accessToken } = req.cookies;

		if (!accessToken) {
			res.status(401).json({
				success: false,
				message: 'Access token required',
			});
			return;
		}

		// Verify access token
		const decoded = verifyAccessToken(accessToken);
		req.user = decoded;
		next();
	} catch (error) {
		res.status(403).json({
			success: false,
			message: 'Invalid or expired access token',
		});
	}
};

/**
 * Optional authentication: attaches req.user if accessToken cookie is valid.
 * If no token or invalid, continues without error to support guest access.
 */
export function optionalAuth(req: Request, res: Response, next: NextFunction): void {
	res;
	try {
		const { accessToken } = req.cookies;
		if (!accessToken) {
			next();
			return;
		}
		const decoded = verifyAccessToken(accessToken);
		req.user = decoded;
		next();
	} catch (error) {
		// treat as guest when token invalid/expired
		next();
	}
}

/**
 * Middleware to authorize user modifications (only own profile)
 */
export const authorizeUserModification = (
	req: Request,
	res: Response,
	next: NextFunction,
): void => {
	const requestedUserId = req.params.id;
	const authenticatedUserId = req.user?.userId;

	if (!authenticatedUserId) {
		res.status(401).json({
			success: false,
			message: 'Authentication required',
		});
		return;
	}

	if (requestedUserId !== authenticatedUserId) {
		res.status(403).json({
			success: false,
			message: 'You can only modify your own profile',
		});
		return;
	}

	next();
};
