import { prisma } from '../utils/prisma';
import { CreateVideoInput, UpdateVideoInput, AttachVideoOptions, Video } from '../types/video';

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
	options?: AttachVideoOptions,
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

export async function listAllVideos(): Promise<Video[]> {
	const videos = await prisma.video.findMany({
		select: {
			id: true,
			courseId: true,
			title: true,
			order: true,
			isTrailer: true,
			sourceUrl: true,
			durationSeconds: true,
		},
		orderBy: [{ courseId: 'asc' }, { order: 'asc' }],
	});

	return videos.map(v => ({
		id: v.id,
		courseId: v.courseId,
		title: v.title,
		order: v.order,
		isTrailer: v.isTrailer,
		sourceUrl: v.sourceUrl,
		durationSeconds: v.durationSeconds ?? null,
	}));
}

export async function getVideoById(videoId: string): Promise<Video | null> {
	const v = await prisma.video.findUnique({
		where: { id: videoId },
		select: {
			id: true,
			courseId: true,
			title: true,
			order: true,
			isTrailer: true,
			sourceUrl: true,
			durationSeconds: true,
		},
	});

	if (!v) return null;
	return {
		id: v.id,
		courseId: v.courseId,
		title: v.title,
		order: v.order,
		isTrailer: v.isTrailer,
		sourceUrl: v.sourceUrl,
		durationSeconds: v.durationSeconds ?? null,
	};
}
