import { Request, Response, NextFunction } from 'express';
import { ZodType } from 'zod';
import { sendError } from '../utils/response';
import { buildValidationErrors } from '../utils/response';

/**
 * Middleware do walidacji body requestu
 */
export function validateBody<T extends ZodType>(schema: T) {
	return (req: Request, res: Response, next: NextFunction): void => {
		const result = schema.safeParse(req.body);

		if (!result.success) {
			const errors = buildValidationErrors(result.error.issues);
			return sendError(res, 'Validation failed', 400, 'VALIDATION_ERROR', errors);
		}

		(req as any).body = result.data;
		next();
	};
}

/**
 * Middleware do walidacji parametrów URL
 */
export function validateParams<T extends ZodType>(schema: T) {
	return (req: Request, res: Response, next: NextFunction): void => {
		const result = schema.safeParse(req.params);

		if (!result.success) {
			const errors = buildValidationErrors(result.error.issues);
			return sendError(res, 'Invalid parameters', 400, 'VALIDATION_ERROR', errors);
		}

		(req as any).params = result.data;
		next();
	};
}

/**
 * Middleware do walidacji query parameters
 */
export function validateQuery<T extends ZodType>(schema: T) {
	return (req: Request, res: Response, next: NextFunction): void => {
		try {
			const result = schema.safeParse(req.query);

			if (!result.success) {
				const errors = buildValidationErrors(result.error.issues);
				return sendError(res, 'Invalid query parameters', 400, 'VALIDATION_ERROR', errors);
			}

			Object.defineProperty(req, 'query', {
				value: result.data,
				writable: true,
				enumerable: true,
				configurable: true,
			});
			next();
		} catch (error) {
			console.error('Error in validateQuery middleware:', error);
			return sendError(res, 'Validation error', 500, 'VALIDATION_ERROR');
		}
	};
}
