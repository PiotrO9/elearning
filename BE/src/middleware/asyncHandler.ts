import { Request, Response, NextFunction, RequestHandler } from 'express';
import { sendError } from '../utils/response';
import { AppError } from '../types/api';
import { handlePrismaError } from '../utils/prismaErrors';

/**
 * Custom error handler function type
 */
type CustomErrorHandler = (error: unknown, req: Request, res: Response) => boolean;

/**
 * Wrapper for async handlers - automatically handles errors
 * @param fn - Async handler function
 * @param customErrorHandler - Optional function for custom error handling
 * @returns Express RequestHandler
 */
export function asyncHandler(
	fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
	customErrorHandler?: CustomErrorHandler,
): RequestHandler {
	return (req: Request, res: Response, next: NextFunction): void => {
		Promise.resolve(fn(req, res, next)).catch((error: unknown) => {
			if (customErrorHandler) {
				const handled = customErrorHandler(error, req, res);
				if (handled) {
					return;
				}
			}

			if (error instanceof AppError) {
				return sendError(res, error.message, error.statusCode, error.code, error.errors);
			}

			const prismaError = handlePrismaError(error);
			if (prismaError) {
				return sendError(res, prismaError.message, prismaError.statusCode, prismaError.code);
			}

			if (
				error &&
				typeof error === 'object' &&
				'statusCode' in error &&
				'message' in error &&
				typeof (error as any).statusCode === 'number' &&
				typeof (error as any).message === 'string'
			) {
				const serviceError = error as { statusCode: number; message: string; code?: string };
				return sendError(res, serviceError.message, serviceError.statusCode, serviceError.code);
			}

			if (error && typeof error === 'object' && 'code' in error) {
				const errorCode = (error as any).code;
				if (errorCode === 'VIDEO_NOT_IN_COURSE') {
					return sendError(res, 'Video not in course', 404, 'VIDEO_NOT_IN_COURSE');
				}
				if (errorCode === 'DUPLICATE_ORDER') {
					return sendError(res, 'Duplicate order values', 400, 'DUPLICATE_ORDER');
				}
			}

			console.error('Unhandled error in async handler:', error);
			return sendError(res, 'Internal server error', 500, 'INTERNAL_SERVER_ERROR');
		});
	};
}
