import { Response, Request } from 'express';
import { ApiErrorItem, ApiErrorResponse, ApiSuccessResponse, AppError } from '../types/api';

export function sendSuccess<T>(res: Response, data?: T, message?: string, statusCode = 200): void {
	const body: ApiSuccessResponse<T> = { success: true };
	if (typeof message === 'string') body.message = message;
	if (typeof data !== 'undefined') body.data = data;
	res.status(statusCode).json(body);
}

export function sendCreated<T>(res: Response, data?: T, message = 'Created'): void {
	sendSuccess<T>(res, data, message, 201);
}

export function sendNoContent(res: Response): void {
	res.status(204).send();
}

export function buildValidationErrors(
	issues: { path: PropertyKey[]; message: string }[],
): ApiErrorItem[] {
	return issues.map(issue => ({
		field: issue.path.map(p => String(p)).join('.'),
		message: issue.message,
	}));
}

export function sendError(
	res: Response,
	message: string,
	statusCode = 500,
	code?: string,
	errors?: ApiErrorItem[],
	traceId?: string,
): void {
	const body: ApiErrorResponse = {
		success: false,
		message,
	};
	if (code) body.code = code;
	if (errors && errors.length > 0) body.errors = errors;
	if (traceId) body.traceId = traceId;
	res.status(statusCode).json(body);
}

export function handleExpressError(err: unknown, req: Request, res: Response): void {
	const traceId = (req as any).traceId as string | undefined;
	if (err instanceof AppError) {
		return sendError(res, err.message, err.statusCode, err.code, err.errors, traceId);
	}
	if (err && typeof err === 'object' && (err as any).statusCode && (err as any).message) {
		const anyErr = err as any;
		return sendError(
			res,
			String(anyErr.message),
			Number(anyErr.statusCode) || 500,
			anyErr.code,
			anyErr.errors,
			traceId,
		);
	}
	return sendError(res, 'Internal server error', 500, 'INTERNAL_SERVER_ERROR', undefined, traceId);
}
