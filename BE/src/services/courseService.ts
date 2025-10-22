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
}): CourseListItem {
	return {
		id: course.id,
		title: course.title,
		summary: course.summary,
		imagePath: course.imagePath,
	};
}

export async function listPublishedCourses(): Promise<CourseListItem[]> {
	const courses = await prisma.course.findMany({
		where: { isPublished: true },
		select: { id: true, title: true, summary: true, imagePath: true },
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
		},
		select: {
			id: true,
			title: true,
			descriptionMarkdown: true,
			imagePath: true,
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
