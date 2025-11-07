import { Request, Response, NextFunction } from 'express';
import {
	verifyAccessToken,
	TokenPayload,
	generateAccessToken,
	SLIDING_SESSION_ENABLED,
} from '../utils/jwt';
import { UserRole } from '../types/user';
import { prisma } from '../utils/prisma';

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
				role: decoded.role,
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

/**
 * Middleware to require admin role (ADMIN or SUPERADMIN)
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
	if (!req.user) {
		res.status(401).json({
			success: false,
			message: 'Authentication required',
		});
		return;
	}

	if (req.user.role !== UserRole.ADMIN && req.user.role !== UserRole.SUPERADMIN) {
		res.status(403).json({
			success: false,
			message: 'Admin access required',
			code: 'ADMIN_ACCESS_REQUIRED',
		});
		return;
	}

	next();
};

/**
 * Middleware to require superadmin role
 */
export const requireSuperAdmin = (req: Request, res: Response, next: NextFunction): void => {
	if (!req.user) {
		res.status(401).json({
			success: false,
			message: 'Authentication required',
		});
		return;
	}

	if (req.user.role !== UserRole.SUPERADMIN) {
		res.status(403).json({
			success: false,
			message: 'Superadmin access required',
			code: 'SUPERADMIN_ACCESS_REQUIRED',
		});
		return;
	}

	next();
};

/**
 * Middleware to check if user has access to a course
 * User has access if:
 * - Course is public
 * - User is enrolled in the course
 * - User is admin
 */
export const checkCourseAccess = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		if (!req.user) {
			res.status(401).json({
				success: false,
				message: 'Authentication required',
			});
			return;
		}

		const courseId = req.params.id || req.params.courseId;
		if (!courseId) {
			res.status(400).json({
				success: false,
				message: 'Course ID required',
			});
			return;
		}

		// Admin and Superadmin have access to everything
		if (req.user.role === UserRole.ADMIN || req.user.role === UserRole.SUPERADMIN) {
			next();
			return;
		}

		// Check if course exists and is public
		const course = await prisma.course.findUnique({
			where: { id: courseId },
			select: { isPublic: true, isPublished: true },
		});

		if (!course) {
			res.status(404).json({
				success: false,
				message: 'Course not found',
				code: 'COURSE_NOT_FOUND',
			});
			return;
		}

		if (!course.isPublished) {
			res.status(403).json({
				success: false,
				message: 'Course is not published',
				code: 'COURSE_NOT_PUBLISHED',
			});
			return;
		}

		// If course is public, allow access
		if (course.isPublic) {
			next();
			return;
		}

		// Check if user is enrolled
		const enrollment = await prisma.courseEnrollment.findUnique({
			where: {
				userId_courseId: {
					userId: req.user.userId,
					courseId: courseId,
				},
			},
		});

		if (!enrollment) {
			res.status(403).json({
				success: false,
				message: 'You do not have access to this course',
				code: 'COURSE_ACCESS_DENIED',
			});
			return;
		}

		next();
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Failed to check course access',
		});
	}
};
