import { prisma } from '../utils/prisma';
import { buildOrderBy } from '../utils/sorting';
import {
	CourseListItem,
	CourseDetail,
	CreateCourseInput,
	UpdateCourseInput,
} from '../types/course';
import { Video } from '../types/video';
import { TagDto } from '../types/tag';

function mapListItem(course: {
	id: string;
	title: string;
	summary: string;
	imagePath: string;
	isPublic: boolean;
	tags?: {
		tag: {
			id: string;
			name: string;
			slug: string;
			description: string | null;
		};
	}[];
}): CourseListItem {
	return {
		id: course.id,
		title: course.title,
		summary: course.summary,
		imagePath: course.imagePath,
		isPublic: course.isPublic,
		tags: course.tags?.map(ct => ({
			id: ct.tag.id,
			name: ct.tag.name,
			slug: ct.tag.slug,
			description: ct.tag.description,
		})),
	};
}

export async function listPublishedCourses(
	tagSlug?: string,
	page?: number,
	limit?: number,
	sortBy?: string,
	sortOrder?: 'asc' | 'desc',
): Promise<{ items: CourseListItem[]; total: number }> {
	const whereClause: any = { isPublished: true };

	// If tagSlug is provided, filter courses by tag
	if (tagSlug) {
		whereClause.tags = {
			some: {
				tag: {
					slug: tagSlug,
				},
			},
		};
	}

	const skip = page && limit ? (page - 1) * limit : undefined;
	const take = limit;

	const orderBy = buildOrderBy(sortBy, {
		validSortFields: ['title', 'createdAt', 'updatedAt'],
		defaultField: 'createdAt',
		defaultOrder: 'desc',
	}, sortOrder);

	const [courses, total] = await Promise.all([
		prisma.course.findMany({
			where: whereClause,
			select: {
				id: true,
				title: true,
				summary: true,
				imagePath: true,
				isPublic: true,
				tags: {
					select: {
						tag: {
							select: {
								id: true,
								name: true,
								slug: true,
								description: true,
							},
						},
					},
				},
			},
			skip,
			take,
			orderBy,
		}),
		prisma.course.count({ where: whereClause }),
	]);

	return {
		items: courses.map(mapListItem),
		total,
	};
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
			tags: {
				select: {
					tag: {
						select: {
							id: true,
							name: true,
							slug: true,
							description: true,
						},
					},
				},
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

	const tags: TagDto[] = course.tags.map(ct => ({
		id: ct.tag.id,
		name: ct.tag.name,
		slug: ct.tag.slug,
		description: ct.tag.description,
	}));

	return {
		id: course.id,
		title: course.title,
		descriptionMarkdown: course.descriptionMarkdown,
		imagePath: course.imagePath,
		isPublic: course.isPublic,
		videos,
		tags,
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
			tags: input.tagIds
				? {
						create: input.tagIds.map(tagId => ({
							tag: { connect: { id: tagId } },
						})),
				  }
				: undefined,
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
			tags: {
				select: {
					tag: {
						select: {
							id: true,
							name: true,
							slug: true,
							description: true,
						},
					},
				},
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
		tags: created.tags.map(ct => ({
			id: ct.tag.id,
			name: ct.tag.name,
			slug: ct.tag.slug,
			description: ct.tag.description,
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
	const { tagIds, ...courseData } = data;

	// Handle tags separately if provided
	if (tagIds !== undefined) {
		await prisma.$transaction(async tx => {
			// Update course data
			await tx.course.update({
				where: { id: courseId },
				data: courseData,
			});

			// Delete existing tags
			await tx.courseTag.deleteMany({
				where: { courseId },
			});

			// Create new tags
			if (tagIds.length > 0) {
				await tx.courseTag.createMany({
					data: tagIds.map(tagId => ({
						courseId,
						tagId,
					})),
				});
			}
		});
	} else {
		// Just update course data without touching tags
		await prisma.course.update({
			where: { id: courseId },
			data: courseData,
		});
	}

	// Fetch updated course with all relations
	const updated = await prisma.course.findUniqueOrThrow({
		where: { id: courseId },
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
			tags: {
				select: {
					tag: {
						select: {
							id: true,
							name: true,
							slug: true,
							description: true,
						},
					},
				},
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
		tags: updated.tags.map(ct => ({
			id: ct.tag.id,
			name: ct.tag.name,
			slug: ct.tag.slug,
			description: ct.tag.description,
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
