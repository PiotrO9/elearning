export interface ApiSuccessResponse<T> {
	success: true;
	message?: string;
	data?: T;
}

export interface ApiErrorItem {
	field?: string;
	message: string;
	code?: string;
}

export interface ApiErrorResponse {
	success: false;
	message: string;
	code?: string;
	errors?: ApiErrorItem[];
	traceId?: string;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export class AppError extends Error {
	public statusCode: number;
	public code?: string;
	public errors?: ApiErrorItem[];

	constructor(message: string, statusCode = 500, code?: string, errors?: ApiErrorItem[]) {
		super(message);
		this.name = 'AppError';
		this.statusCode = statusCode;
		this.code = code;
		this.errors = errors;
	}
}

export class NotFoundError extends AppError {
	constructor(message = 'Not Found', code = 'NOT_FOUND') {
		super(message, 404, code);
		this.name = 'NotFoundError';
	}
}

export class ValidationError extends AppError {
	constructor(message = 'Validation failed', errors?: ApiErrorItem[], code = 'VALIDATION_ERROR') {
		super(message, 400, code, errors);
		this.name = 'ValidationError';
	}
}

export class UnauthorizedError extends AppError {
	constructor(message = 'Unauthorized', code = 'UNAUTHORIZED') {
		super(message, 401, code);
		this.name = 'UnauthorizedError';
	}
}

export class ConflictError extends AppError {
	constructor(message = 'Conflict', code = 'CONFLICT') {
		super(message, 409, code);
		this.name = 'ConflictError';
	}
}

/**
 * Ustandaryzowany format paginacji
 */
export interface Pagination {
	currentPage: number;
	totalPages: number;
	totalItems: number;
	limit: number;
}

/**
 * Ustandaryzowany format odpowiedzi z listą elementów
 */
export interface PaginatedListResponse<T> {
	items: T[];
	pagination: Pagination;
}