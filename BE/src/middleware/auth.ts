import { Request, Response, NextFunction } from 'express';
import {
	verifyAccessToken,
	TokenPayload,
	generateAccessToken,
	SLIDING_SESSION_ENABLED,
} from '../utils/jwt';
import { UserRole } from '../types/user';
import { prisma } from '../utils/prisma';
import { sendError } from '../utils/response';

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
			return sendError(res, 'Access token required', 401, 'ACCESS_TOKEN_REQUIRED');
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
		return sendError(res, 'Invalid or expired access token', 403, 'INVALID_TOKEN');
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
			return sendError(res, 'Access token required', 401, 'ACCESS_TOKEN_REQUIRED');
		}

		// Verify access token
		const decoded = verifyAccessToken(accessToken);
		req.user = decoded;
		next();
	} catch (error) {
		return sendError(res, 'Invalid or expired access token', 403, 'INVALID_TOKEN');
	}
};

/**
 * Optional authentication: attaches req.user if accessToken cookie is valid.
 * If no token or invalid, continues without error to support guest access.
 */
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
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
		return sendError(res, 'Authentication required', 401, 'UNAUTHENTICATED');
	}

	if (requestedUserId !== authenticatedUserId) {
		return sendError(res, 'You can only modify your own profile', 403, 'FORBIDDEN');
	}

	next();
};

/**
 * Middleware to require admin role (ADMIN or SUPERADMIN)
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
	if (!req.user) {
		return sendError(res, 'Authentication required', 401, 'UNAUTHENTICATED');
	}

	if (req.user.role !== UserRole.ADMIN && req.user.role !== UserRole.SUPERADMIN) {
		return sendError(res, 'Admin access required', 403, 'ADMIN_ACCESS_REQUIRED');
	}

	next();
};

/**
 * Middleware to require superadmin role
 */
export const requireSuperAdmin = (req: Request, res: Response, next: NextFunction): void => {
	if (!req.user) {
		return sendError(res, 'Authentication required', 401, 'UNAUTHENTICATED');
	}

	if (req.user.role !== UserRole.SUPERADMIN) {
		return sendError(res, 'Superadmin access required', 403, 'SUPERADMIN_ACCESS_REQUIRED');
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
			return sendError(res, 'Authentication required', 401, 'UNAUTHENTICATED');
		}

		const courseId = req.params.id || req.params.courseId;
		if (!courseId) {
			return sendError(res, 'Course ID required', 400, 'COURSE_ID_REQUIRED');
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
			return sendError(res, 'Course not found', 404, 'COURSE_NOT_FOUND');
		}

		if (!course.isPublished) {
			return sendError(res, 'Course is not published', 403, 'COURSE_NOT_PUBLISHED');
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
			return sendError(res, 'You do not have access to this course', 403, 'COURSE_ACCESS_DENIED');
		}

		next();
	} catch (error) {
		return sendError(res, 'Failed to check course access', 500, 'INTERNAL_SERVER_ERROR');
	}
};
