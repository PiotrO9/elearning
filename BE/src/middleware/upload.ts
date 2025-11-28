import multer from 'multer';
import { Request, Response, NextFunction } from 'express';

const UPLOAD_CONFIG = {
	MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
	ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
	FIELD_NAME: 'image',
	MAX_FILES: 1,
} as const;

const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
	if (file.mimetype && UPLOAD_CONFIG.ALLOWED_IMAGE_TYPES.includes(file.mimetype as any)) {
		cb(null, true);
	} else {
		const error = new Error(
			`Invalid file type. Allowed types: ${UPLOAD_CONFIG.ALLOWED_IMAGE_TYPES.join(', ')}`,
		);
		cb(error);
	}
};

const storage = multer.memoryStorage();

export const uploadCourseImage = multer({
	storage,
	fileFilter,
	limits: {
		fileSize: UPLOAD_CONFIG.MAX_FILE_SIZE,
		files: UPLOAD_CONFIG.MAX_FILES,
	},
}).single(UPLOAD_CONFIG.FIELD_NAME);

const ERROR_CODES = {
	FILE_TOO_LARGE: 'FILE_TOO_LARGE',
	TOO_MANY_FILES: 'TOO_MANY_FILES',
	INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
} as const;

const MAX_FILE_SIZE_MB = UPLOAD_CONFIG.MAX_FILE_SIZE / (1024 * 1024);

function sendUploadError(res: Response, message: string, code: string): void {
	res.status(400).json({
		success: false,
		message,
		code,
	});
}

export function handleUploadError(
	error: unknown,
	_req: Request,
	res: Response,
	next: NextFunction,
): void {
	if (error instanceof multer.MulterError) {
		if (error.code === 'LIMIT_FILE_SIZE') {
			sendUploadError(
				res,
				`File too large. Maximum size is ${MAX_FILE_SIZE_MB}MB`,
				ERROR_CODES.FILE_TOO_LARGE,
			);
			return;
		}
		if (error.code === 'LIMIT_FILE_COUNT') {
			sendUploadError(
				res,
				`Too many files. Only ${UPLOAD_CONFIG.MAX_FILES} file is allowed`,
				ERROR_CODES.TOO_MANY_FILES,
			);
			return;
		}
	}
	if (error instanceof Error && error.message.includes('Invalid file type')) {
		sendUploadError(res, error.message, ERROR_CODES.INVALID_FILE_TYPE);
		return;
	}
	next(error);
}
