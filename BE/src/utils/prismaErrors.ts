import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

/**
 * Konfiguracja mapowania błędów Prisma na odpowiedzi API
 */
export interface PrismaErrorMapping {
	/**
	 * Domyślny komunikat błędu dla danego kodu
	 */
	defaultMessage: string;
	/**
	 * Domyślny kod błędu API
	 */
	defaultCode: string;
	/**
	 * Status HTTP
	 */
	statusCode: number;
	/**
	 * Opcjonalne mapowanie komunikatów w zależności od kontekstu
	 */
	customMessages?: Record<string, { message: string; code: string }>;
}

/**
 * Mapowanie kodów błędów Prisma na konfigurację odpowiedzi
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
 * Sprawdza czy błąd jest błędem Prisma
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
 * Obsługuje błąd Prisma i zwraca odpowiednią konfigurację odpowiedzi API
 * @param error - Błąd do obsłużenia
 * @param context - Kontekst błędu (np. 'course', 'video', 'video_order') - używany do customizacji komunikatu
 * @returns Konfiguracja odpowiedzi lub null jeśli błąd nie jest błędem Prisma
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
		// Nieznany kod błędu Prisma
		return {
			message: 'Database error occurred',
			statusCode: 500,
			code: 'DATABASE_ERROR',
		};
	}

	// Sprawdź czy jest custom message dla danego kontekstu
	if (context && mapping.customMessages?.[context]) {
		const custom = mapping.customMessages[context];
		return {
			message: custom.message,
			statusCode: mapping.statusCode,
			code: custom.code,
		};
	}

	// Zwróć domyślny komunikat
	return {
		message: mapping.defaultMessage,
		statusCode: mapping.statusCode,
		code: mapping.defaultCode,
	};
}
