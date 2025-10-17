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

export interface CreateCourseInput {
	title: string;
	summary: string;
	descriptionMarkdown: string;
	imagePath: string;
	isPublished?: boolean;
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
			videos: { select: { id: true }, orderBy: { order: 'asc' } },
		},
	});

	return {
		id: created.id,
		title: created.title,
		descriptionMarkdown: created.descriptionMarkdown,
		imagePath: created.imagePath,
		videoIds: created.videos.map(v => v.id),
	};
}

export async function deleteCourse(courseId: string): Promise<boolean> {
	await prisma.course.delete({ where: { id: courseId } });
	return true;
}

export interface UpdateCourseInput {
	title?: string;
	summary?: string;
	descriptionMarkdown?: string;
	imagePath?: string;
	isPublished?: boolean;
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
			videos: { select: { id: true }, orderBy: { order: 'asc' } },
		},
	});

	return {
		id: updated.id,
		title: updated.title,
		descriptionMarkdown: updated.descriptionMarkdown,
		imagePath: updated.imagePath,
		videoIds: updated.videos.map(v => v.id),
	};
}
