import { prisma } from '../utils/prisma';
import { buildOrderBy } from '../utils/sorting';
import {
	CourseListItem,
	CourseDetail,
	CreateCourseInput,
	UpdateCourseInput,
	InstructorDto,
} from '../types/course';
import { Video } from '../types/video';
import { TagDto } from '../types/tag';
import {
	BUCKET_COURSES,
	uploadFile,
	deleteFile,
	generateCourseImagePath,
	getPublicUrl,
} from '../utils/minio';

function convertImagePathToUrl(imagePath: string | null | undefined): string | null | undefined {
	if (!imagePath) {
		return imagePath;
	}
	return imagePath.startsWith('http') ? imagePath : getPublicUrl(BUCKET_COURSES, imagePath);
}

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
			createdAt: Date;
		};
	}[];
	instructors?: {
		user: {
			id: string;
			username: string;
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
			createdAt: ct.tag.createdAt,
		})),
		instructors: course.instructors?.map(ci => ({
			id: ci.user.id,
			username: ci.user.username,
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

	const orderBy = buildOrderBy(
		sortBy,
		{
			validSortFields: ['title', 'createdAt', 'updatedAt'],
			defaultField: 'createdAt',
			defaultOrder: 'desc',
		},
		sortOrder,
	);

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
								createdAt: true,
							},
						},
					},
				},
				instructors: {
					select: {
						user: {
							select: {
								id: true,
								username: true,
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
		items: courses.map(course => {
			const item = mapListItem(course);
			item.imagePath = convertImagePathToUrl(item.imagePath) || '';
			return item;
		}),
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
							createdAt: true,
						},
					},
				},
			},
			instructors: {
				select: {
					user: {
						select: {
							id: true,
							username: true,
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
		createdAt: ct.tag.createdAt,
	}));

	const instructors: InstructorDto[] = course.instructors.map(ci => ({
		id: ci.user.id,
		username: ci.user.username,
	}));

	return {
		id: course.id,
		title: course.title,
		descriptionMarkdown: course.descriptionMarkdown,
		imagePath: convertImagePathToUrl(course.imagePath) || '',
		isPublic: course.isPublic,
		videos,
		tags,
		instructors,
	};
}

const COURSE_SELECT = {
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
		orderBy: { order: 'asc' } as const,
	},
	tags: {
		select: {
			tag: {
				select: {
					id: true,
					name: true,
					slug: true,
					description: true,
					createdAt: true,
				},
			},
		},
	},
	instructors: {
		select: {
			user: {
				select: {
					id: true,
					username: true,
				},
			},
		},
	},
} as const;

function buildCourseData(input: CreateCourseInput, imagePath: string) {
	return {
		title: input.title,
		summary: input.summary,
		descriptionMarkdown: input.descriptionMarkdown,
		imagePath,
		isPublished: input.isPublished ?? true,
		isPublic: input.isPublic ?? false,
		tags: input.tagIds
			? {
					create: input.tagIds.map(tagId => ({
						tag: { connect: { id: tagId } },
					})),
			  }
			: undefined,
	};
}

function mapCourseToDetail(course: {
	id: string;
	title: string;
	descriptionMarkdown: string;
	imagePath: string;
	isPublic: boolean;
	videos: {
		id: string;
		courseId: string | null;
		title: string;
		order: number;
		isTrailer: boolean;
		sourceUrl: string;
		durationSeconds: number | null;
	}[];
	tags: {
		tag: {
			id: string;
			name: string;
			slug: string;
			description: string | null;
			createdAt: Date;
		};
	}[];
	instructors: {
		user: {
			id: string;
			username: string;
		};
	}[];
}): CourseDetail {
	return {
		id: course.id,
		title: course.title,
		descriptionMarkdown: course.descriptionMarkdown,
		imagePath: convertImagePathToUrl(course.imagePath) || '',
		isPublic: course.isPublic,
		videos: course.videos.map(v => ({
			id: v.id,
			courseId: v.courseId,
			title: v.title,
			order: v.order,
			isTrailer: v.isTrailer,
			sourceUrl: v.sourceUrl,
			durationSeconds: v.durationSeconds ?? null,
		})),
		tags: course.tags.map(ct => ({
			id: ct.tag.id,
			name: ct.tag.name,
			slug: ct.tag.slug,
			description: ct.tag.description,
			createdAt: ct.tag.createdAt,
		})),
		instructors: course.instructors.map(ci => ({
			id: ci.user.id,
			username: ci.user.username,
		})),
	};
}

export async function createCourse(
	input: CreateCourseInput,
	imageBuffer?: Buffer,
	imageFilename?: string,
	imageContentType?: string,
): Promise<CourseDetail> {
	let imagePath = input.imagePath;
	let courseId: string;

	if (imageBuffer && imageFilename) {
		const created = await prisma.course.create({
			data: buildCourseData(input, ''),
			select: { id: true },
		});
		courseId = created.id;

		try {
			const objectName = generateCourseImagePath(courseId, imageFilename);
			await uploadFile({
				bucketName: BUCKET_COURSES,
				objectName,
				buffer: imageBuffer,
				contentType: imageContentType || 'image/jpeg',
			});

			await prisma.course.update({
				where: { id: courseId },
				data: { imagePath: objectName },
			});
			imagePath = objectName;
		} catch (error) {
			await prisma.course.delete({ where: { id: courseId } });
			throw error;
		}
	} else {
		const created = await prisma.course.create({
			data: buildCourseData(input, imagePath),
			select: { id: true },
		});
		courseId = created.id;
	}

	const created = await prisma.course.findUniqueOrThrow({
		where: { id: courseId },
		select: COURSE_SELECT,
	});

	return mapCourseToDetail(created);
}

export async function deleteCourse(courseId: string): Promise<boolean> {
	const course = await prisma.course.findUnique({
		where: { id: courseId },
		select: { imagePath: true },
	});

	if (course?.imagePath) {
		try {
			await deleteFile(BUCKET_COURSES, course.imagePath);
		} catch (error) {
			console.error(`Failed to delete image for course ${courseId}:`, error);
		}
	}

	await prisma.course.delete({ where: { id: courseId } });
	return true;
}

export async function updateCourse(
	courseId: string,
	data: UpdateCourseInput,
	imageBuffer?: Buffer,
	imageFilename?: string,
	imageContentType?: string,
): Promise<CourseDetail> {
	const { tagIds, ...courseData } = data;

	if (imageBuffer && imageFilename) {
		const existingCourse = await prisma.course.findUnique({
			where: { id: courseId },
			select: { imagePath: true },
		});

		if (existingCourse?.imagePath && !existingCourse.imagePath.startsWith('http')) {
			try {
				await deleteFile(BUCKET_COURSES, existingCourse.imagePath);
			} catch (error) {
				console.error(`Failed to delete old image for course ${courseId}:`, error);
			}
		}

		const objectName = generateCourseImagePath(courseId, imageFilename);
		await uploadFile({
			bucketName: BUCKET_COURSES,
			objectName,
			buffer: imageBuffer,
			contentType: imageContentType || 'image/jpeg',
		});
		courseData.imagePath = objectName;
	}

	if (tagIds !== undefined) {
		await prisma.$transaction(async tx => {
			await tx.course.update({
				where: { id: courseId },
				data: courseData,
			});

			await tx.courseTag.deleteMany({
				where: { courseId },
			});

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
		await prisma.course.update({
			where: { id: courseId },
			data: courseData,
		});
	}

	const updated = await prisma.course.findUniqueOrThrow({
		where: { id: courseId },
		select: COURSE_SELECT,
	});

	return mapCourseToDetail(updated);
}

export async function reorderCourseVideos(
	courseId: string,
	items: { id: string; order: number }[],
): Promise<void> {
	if (items.length === 0) {
		return;
	}

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
		const existing = await tx.video.findMany({
			where: { courseId },
			select: { id: true },
		});
		const existingIds = new Set(existing.map(v => v.id));

		for (const item of items) {
			if (!existingIds.has(item.id)) {
				throw Object.assign(new Error('Video not in course'), {
					statusCode: 404,
					code: 'VIDEO_NOT_IN_COURSE',
				});
			}
		}

		for (const item of items) {
			await tx.video.update({ where: { id: item.id }, data: { order: item.order } });
		}
	});
}
