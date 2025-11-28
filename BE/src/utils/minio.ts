import * as Minio from 'minio';
import { randomUUID } from 'crypto';

interface MinioConfig {
	endPoint: string;
	port: number;
	useSSL: boolean;
	accessKey: string;
	secretKey: string;
}

function getMinioConfig(): MinioConfig {
	return {
		endPoint: process.env.MINIO_ENDPOINT || 'localhost',
		port: parseInt(process.env.MINIO_PORT || '9000', 10),
		useSSL: process.env.MINIO_USE_SSL === 'true',
		accessKey: process.env.MINIO_ACCESS_KEY || process.env.MINIO_ROOT_USER || 'minioadmin',
		secretKey: process.env.MINIO_SECRET_KEY || process.env.MINIO_ROOT_PASSWORD || 'minioadmin',
	};
}

const minioClient = new Minio.Client(getMinioConfig());

export const BUCKET_COURSES = process.env.MINIO_BUCKET_COURSES || 'course-images';
export const MINIO_PUBLIC_URL = process.env.MINIO_PUBLIC_URL || 'http://localhost:9000';

const DEFAULT_BUCKET_REGION = 'us-east-1';
const PUBLIC_READ_POLICY = {
	Version: '2012-10-17',
	Statement: [
		{
			Effect: 'Allow',
			Principal: { AWS: ['*'] },
			Action: ['s3:GetObject'],
			Resource: [`arn:aws:s3:::${BUCKET_COURSES}/*`],
		},
	],
};

async function ensureBucketExists(bucketName: string): Promise<void> {
	const exists = await minioClient.bucketExists(bucketName);
	if (!exists) {
		await minioClient.makeBucket(bucketName, DEFAULT_BUCKET_REGION);
		const policy = {
			...PUBLIC_READ_POLICY,
			Statement: [
				{
					...PUBLIC_READ_POLICY.Statement[0],
					Resource: [`arn:aws:s3:::${bucketName}/*`],
				},
			],
		};
		await minioClient.setBucketPolicy(bucketName, JSON.stringify(policy));
	}
}

export async function initializeMinIO(): Promise<void> {
	try {
		await ensureBucketExists(BUCKET_COURSES);
		console.log(`MinIO initialized: bucket "${BUCKET_COURSES}" ready`);
	} catch (error) {
		console.error('Error initializing MinIO:', error);
		throw error;
	}
}

export interface UploadFileOptions {
	bucketName: string;
	objectName: string;
	filePath?: string;
	buffer?: Buffer;
	contentType?: string;
}

export async function uploadFile(options: UploadFileOptions): Promise<string> {
	const { bucketName, objectName, filePath, buffer, contentType } = options;

	if (filePath) {
		await minioClient.fPutObject(bucketName, objectName, filePath, {
			'Content-Type': contentType || 'application/octet-stream',
		});
	} else if (buffer) {
		await minioClient.putObject(bucketName, objectName, buffer, buffer.length, {
			'Content-Type': contentType || 'application/octet-stream',
		});
	} else {
		throw new Error('Either filePath or buffer must be provided');
	}

	return objectName;
}

export async function deleteFile(bucketName: string, objectName: string): Promise<void> {
	await minioClient.removeObject(bucketName, objectName);
}

const DEFAULT_PRESIGNED_URL_EXPIRY = 24 * 60 * 60; // 24 hours

export async function getPresignedUrl(
	bucketName: string,
	objectName: string,
	expiry: number = DEFAULT_PRESIGNED_URL_EXPIRY,
): Promise<string> {
	return await minioClient.presignedGetObject(bucketName, objectName, expiry);
}

export function getPublicUrl(bucketName: string, objectName: string): string {
	return `${MINIO_PUBLIC_URL}/${bucketName}/${objectName}`;
}

const DEFAULT_IMAGE_EXTENSION = 'jpg';

export function generateCourseImagePath(courseId: string, originalFilename: string): string {
	const extension = originalFilename.split('.').pop() || DEFAULT_IMAGE_EXTENSION;
	const filename = `${randomUUID()}.${extension}`;
	return `courses/${courseId}/${filename}`;
}

export async function fileExists(bucketName: string, objectName: string): Promise<boolean> {
	try {
		await minioClient.statObject(bucketName, objectName);
		return true;
	} catch (error) {
		return false;
	}
}

export { minioClient };
