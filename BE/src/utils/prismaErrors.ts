import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

/**
 * Configuration for mapping Prisma errors to API responses
 */
export interface PrismaErrorMapping {
	/**
	 * Default error message for the given code
	 */
	defaultMessage: string;
	/**
	 * Default API error code
	 */
	defaultCode: string;
	/**
	 * HTTP status code
	 */
	statusCode: number;
	/**
	 * Optional message mapping depending on context
	 */
	customMessages?: Record<string, { message: string; code: string }>;
}

/**
 * Mapping of Prisma error codes to response configuration
 */
const PRISMA_ERROR_MAPPINGS: Record<string, PrismaErrorMapping> = {
	P2025: {
		defaultMessage: 'Record not found',
		defaultCode: 'NOT_FOUND',
		statusCode: 404,
		customMessages: {
			course: { message: 'Course not found', code: 'COURSE_NOT_FOUND' },
			video: { message: 'Video not found', code: 'VIDEO_NOT_FOUND' },
			user: { message: 'User not found', code: 'USER_NOT_FOUND' },
			tag: { message: 'Tag not found', code: 'TAG_NOT_FOUND' },
		},
	},
	P2002: {
		defaultMessage: 'Unique constraint violation',
		defaultCode: 'UNIQUE_CONSTRAINT_VIOLATION',
		statusCode: 409,
		customMessages: {
			video_order: {
				message: 'Video order must be unique within course',
				code: 'VIDEO_ORDER_CONFLICT',
			},
			user_email: { message: 'User with this email already exists', code: 'USER_EXISTS' },
			user_username: { message: 'User with this username already exists', code: 'USER_EXISTS' },
		},
	},
	P2003: {
		defaultMessage: 'Foreign key constraint violation',
		defaultCode: 'FOREIGN_KEY_VIOLATION',
		statusCode: 400,
	},
	P2014: {
		defaultMessage: 'Required relation violation',
		defaultCode: 'RELATION_VIOLATION',
		statusCode: 400,
	},
};

/**
 * Checks if error is a Prisma error
 */
export function isPrismaError(error: unknown): error is PrismaClientKnownRequestError {
	return (
		typeof error === 'object' &&
		error !== null &&
		'code' in error &&
		typeof (error as any).code === 'string' &&
		(error as any).code.startsWith('P')
	);
}

/**
 * Handles Prisma error and returns appropriate API response configuration
 * @param error - Error to handle
 * @param context - Error context (e.g. 'course', 'video', 'video_order') - used for message customization
 * @returns Response configuration or null if error is not a Prisma error
 */
export function handlePrismaError(
	error: unknown,
	context?: string,
): { message: string; statusCode: number; code: string } | null {
	if (!isPrismaError(error)) {
		return null;
	}

	const errorCode = error.code;
	const mapping = PRISMA_ERROR_MAPPINGS[errorCode];

	if (!mapping) {
		return {
			message: 'Database error occurred',
			statusCode: 500,
			code: 'DATABASE_ERROR',
		};
	}

	if (context && mapping.customMessages?.[context]) {
		const custom = mapping.customMessages[context];
		return {
			message: custom.message,
			statusCode: mapping.statusCode,
			code: custom.code,
		};
	}

	return {
		message: mapping.defaultMessage,
		statusCode: mapping.statusCode,
		code: mapping.defaultCode,
	};
}
