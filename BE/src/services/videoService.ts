import { prisma } from '../utils/prisma';

export interface CreateVideoInput {
	courseId: string;
	title: string;
	order: number;
	isTrailer?: boolean;
	sourceUrl: string;
	durationSeconds?: number | null;
}

export interface UpdateVideoInput {
	courseId?: string;
	title?: string;
	order?: number;
	isTrailer?: boolean;
	sourceUrl?: string;
	durationSeconds?: number | null;
}

export async function createVideo(input: CreateVideoInput): Promise<string> {
	const created = await prisma.video.create({
		data: {
			courseId: input.courseId,
			title: input.title,
			order: input.order,
			isTrailer: input.isTrailer ?? false,
			sourceUrl: input.sourceUrl,
			durationSeconds: input.durationSeconds ?? null,
		},
		select: { id: true },
	});
	return created.id;
}

export async function updateVideo(videoId: string, data: UpdateVideoInput): Promise<void> {
	await prisma.video.update({
		where: { id: videoId },
		data,
	});
}

export async function deleteVideo(videoId: string): Promise<void> {
	await prisma.video.delete({ where: { id: videoId } });
}

export async function attachExistingVideoToCourse(
	videoId: string,
	courseId: string,
	options?: { order?: number; isTrailer?: boolean },
): Promise<void> {
	const updateData: Record<string, any> = { courseId };
	if (typeof options?.order === 'number') updateData.order = options.order;
	if (typeof options?.isTrailer === 'boolean') updateData.isTrailer = options.isTrailer;

	await prisma.video.update({ where: { id: videoId }, data: updateData });
}

export async function detachVideoFromCourse(videoId: string): Promise<void> {
	// Deleting the video to detach, assuming videos are always tied to a course
	await prisma.video.delete({ where: { id: videoId } });
}
