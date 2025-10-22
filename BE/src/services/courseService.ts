import { prisma } from '../utils/prisma';
import {
	CourseListItem,
	CourseDetail,
	CreateCourseInput,
	UpdateCourseInput,
} from '../types/course';
import { Video } from '../types/video';

function mapListItem(course: {
	id: string;
	title: string;
	summary: string;
	imagePath: string;
	isPublic: boolean;
}): CourseListItem {
	return {
		id: course.id,
		title: course.title,
		summary: course.summary,
		imagePath: course.imagePath,
		isPublic: course.isPublic,
	};
}

export async function listPublishedCourses(): Promise<CourseListItem[]> {
	const courses = await prisma.course.findMany({
		where: { isPublished: true },
		select: { id: true, title: true, summary: true, imagePath: true, isPublic: true },
		orderBy: { createdAt: 'desc' },
	});

	return courses.map(mapListItem);
}

export async function getCourseDetail(
	courseId: string,
	isAuthenticated: boolean,
): Promise<CourseDetail | null> {
	const course = await prisma.course.findFirst({
		where: { id: courseId, isPublished: true },
		select: {
			id: true,
			title: true,
			descriptionMarkdown: true,
			imagePath: true,
			isPublic: true,
			videos: {
				select: {
					id: true,
					courseId: true,
					title: true,
					order: true,
					isTrailer: true,
					sourceUrl: true,
					durationSeconds: true,
				},
				orderBy: { order: 'asc' },
			},
		},
	});

	if (!course) {
		return null;
	}

	const videos: Video[] = (
		isAuthenticated
			? course.videos
			: (() => {
					const trailer = course.videos.find((v: { isTrailer: boolean }) => v.isTrailer === true);
					return trailer ? [trailer] : [];
			  })()
	).map(v => ({
		id: v.id,
		courseId: v.courseId,
		title: v.title,
		order: v.order,
		isTrailer: v.isTrailer,
		sourceUrl: v.sourceUrl,
		durationSeconds: v.durationSeconds ?? null,
	}));

	return {
		id: course.id,
		title: course.title,
		descriptionMarkdown: course.descriptionMarkdown,
		imagePath: course.imagePath,
		isPublic: course.isPublic,
		videos,
	};
}

export async function createCourse(input: CreateCourseInput): Promise<CourseDetail> {
	const created = await prisma.course.create({
		data: {
			title: input.title,
			summary: input.summary,
			descriptionMarkdown: input.descriptionMarkdown,
			imagePath: input.imagePath,
			isPublished: input.isPublished ?? true,
			isPublic: input.isPublic ?? false,
		},
		select: {
			id: true,
			title: true,
			descriptionMarkdown: true,
			imagePath: true,
			isPublic: true,
			videos: {
				select: {
					id: true,
					courseId: true,
					title: true,
					order: true,
					isTrailer: true,
					sourceUrl: true,
					durationSeconds: true,
				},
				orderBy: { order: 'asc' },
			},
		},
	});

	return {
		id: created.id,
		title: created.title,
		descriptionMarkdown: created.descriptionMarkdown,
		imagePath: created.imagePath,
		isPublic: created.isPublic,
		videos: created.videos.map(v => ({
			id: v.id,
			courseId: v.courseId,
			title: v.title,
			order: v.order,
			isTrailer: v.isTrailer,
			sourceUrl: v.sourceUrl,
			durationSeconds: v.durationSeconds ?? null,
		})),
	};
}

export async function deleteCourse(courseId: string): Promise<boolean> {
	await prisma.course.delete({ where: { id: courseId } });
	return true;
}

export async function updateCourse(
	courseId: string,
	data: UpdateCourseInput,
): Promise<CourseDetail> {
	const updated = await prisma.course.update({
		where: { id: courseId },
		data,
		select: {
			id: true,
			title: true,
			descriptionMarkdown: true,
			imagePath: true,
			isPublic: true,
			videos: {
				select: {
					id: true,
					courseId: true,
					title: true,
					order: true,
					isTrailer: true,
					sourceUrl: true,
					durationSeconds: true,
				},
				orderBy: { order: 'asc' },
			},
		},
	});

	return {
		id: updated.id,
		title: updated.title,
		descriptionMarkdown: updated.descriptionMarkdown,
		imagePath: updated.imagePath,
		isPublic: updated.isPublic,
		videos: updated.videos.map(v => ({
			id: v.id,
			courseId: v.courseId,
			title: v.title,
			order: v.order,
			isTrailer: v.isTrailer,
			sourceUrl: v.sourceUrl,
			durationSeconds: v.durationSeconds ?? null,
		})),
	};
}

export async function reorderCourseVideos(
	courseId: string,
	items: { id: string; order: number }[],
): Promise<void> {
	if (items.length === 0) {
		return;
	}

	// Ensure unique orders and ids
	const targetOrders = new Set(items.map(i => i.order));
	if (targetOrders.size !== items.length) {
		throw Object.assign(new Error('Duplicate order values'), {
			statusCode: 400,
			code: 'DUPLICATE_ORDER',
		});
	}
	const targetIds = new Set(items.map(i => i.id));
	if (targetIds.size !== items.length) {
		throw Object.assign(new Error('Duplicate video ids'), { statusCode: 400, code: 'DUPLICATE_ID' });
	}

	await prisma.$transaction(async tx => {
		// Fetch existing videos for the course
		const existing = await tx.video.findMany({
			where: { courseId },
			select: { id: true },
		});
		const existingIds = new Set(existing.map(v => v.id));

		// Validate that all provided ids belong to the course
		for (const item of items) {
			if (!existingIds.has(item.id)) {
				throw Object.assign(new Error('Video not in course'), {
					statusCode: 404,
					code: 'VIDEO_NOT_IN_COURSE',
				});
			}
		}

		// Optionally, ensure the full set matches existing to keep contiguous sequence
		// Not mandatory: allow partial reorder of subset

		// Update orders
		for (const item of items) {
			await tx.video.update({ where: { id: item.id }, data: { order: item.order } });
		}
	});
}
