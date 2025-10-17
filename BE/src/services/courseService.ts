import { prisma } from '../utils/prisma';

export interface CourseListItem {
	id: string;
	title: string;
	summary: string;
	imagePath: string;
}

export interface CourseDetail {
	id: string;
	title: string;
	descriptionMarkdown: string;
	imagePath: string;
	videoIds: string[];
}

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
				select: { id: true, isTrailer: true, order: true },
				orderBy: { order: 'asc' },
			},
		},
	});

	if (!course) {
		return null;
	}

	const videoIds = isAuthenticated
		? course.videos.map((v: { id: string }) => v.id)
		: (() => {
				const trailer = course.videos.find((v: { isTrailer: boolean }) => v.isTrailer === true);
				return trailer ? [trailer.id] : [];
		  })();

	return {
		id: course.id,
		title: course.title,
		descriptionMarkdown: course.descriptionMarkdown,
		imagePath: course.imagePath,
		videoIds,
	};
}
