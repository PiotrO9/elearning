import { prisma } from '../utils/prisma';
import { Tag, TagDto, CreateTagInput, UpdateTagInput, TagWithCourses } from '../types/tag';

/**
 * Generate slug from name
 */
function generateSlug(name: string): string {
	return name
		.toLowerCase()
		.trim()
		.replace(/[^\w\s-]/g, '')
		.replace(/[\s_-]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

/**
 * Get all tags
 */
export async function getAllTags(
	page?: number,
	limit?: number,
	sortBy?: string,
	sortOrder?: 'asc' | 'desc',
): Promise<{ items: TagDto[]; total: number }> {
	const skip = page && limit ? (page - 1) * limit : undefined;
	const take = limit;

	// Validate and set sortBy
	const validSortFields = ['name', 'createdAt'];
	const sortField = sortBy && validSortFields.includes(sortBy) ? sortBy : 'name';
	const order = sortOrder || 'asc';

	const [tags, total] = await Promise.all([
		prisma.tag.findMany({
			include: {
				_count: {
					select: { courses: true },
				},
			},
			skip,
			take,
			orderBy: { [sortField]: order },
		}),
		prisma.tag.count(),
	]);

	return {
		items: tags.map(tag => ({
			id: tag.id,
			name: tag.name,
			slug: tag.slug,
			description: tag.description,
			coursesCount: tag._count.courses,
		})),
		total,
	};
}

/**
 * Get tag by ID with courses
 */
export async function getTagById(tagId: string): Promise<TagWithCourses | null> {
	const tag = await prisma.tag.findUnique({
		where: { id: tagId },
		include: {
			courses: {
				include: {
					course: {
						select: {
							id: true,
							title: true,
							summary: true,
							imagePath: true,
						},
					},
				},
			},
		},
	});

	return tag;
}

/**
 * Get tag by slug
 */
export async function getTagBySlug(slug: string): Promise<TagWithCourses | null> {
	const tag = await prisma.tag.findUnique({
		where: { slug },
		include: {
			courses: {
				include: {
					course: {
						select: {
							id: true,
							title: true,
							summary: true,
							imagePath: true,
						},
					},
				},
			},
		},
	});

	return tag;
}

/**
 * Create new tag
 */
export async function createTag(input: CreateTagInput): Promise<Tag> {
	const slug = input.slug || generateSlug(input.name);

	const existingTag = await prisma.tag.findUnique({
		where: { slug },
	});

	if (existingTag) {
		throw new Error('Tag z tym slugiem już istnieje');
	}

	const existingNameTag = await prisma.tag.findUnique({
		where: { name: input.name },
	});

	if (existingNameTag) {
		throw new Error('Tag z tą nazwą już istnieje');
	}

	const tag = await prisma.tag.create({
		data: {
			name: input.name,
			slug,
			description: input.description,
		},
	});

	return tag;
}

/**
 * Update tag
 */
export async function updateTag(tagId: string, input: UpdateTagInput): Promise<Tag> {
	const existingTag = await prisma.tag.findUnique({
		where: { id: tagId },
	});

	if (!existingTag) {
		throw new Error('Tag nie istnieje');
	}

	if (input.slug && input.slug !== existingTag.slug) {
		const slugExists = await prisma.tag.findUnique({
			where: { slug: input.slug },
		});

		if (slugExists) {
			throw new Error('Tag z tym slugiem już istnieje');
		}
	}

	const updateData: any = { ...input };

	if (input.name && input.name !== existingTag.name) {
		const nameExists = await prisma.tag.findUnique({
			where: { name: input.name },
		});

		if (nameExists) {
			throw new Error('Tag z tą nazwą już istnieje');
		}

		if (!input.slug) {
			updateData.slug = generateSlug(input.name);
		}
	}

	const tag = await prisma.tag.update({
		where: { id: tagId },
		data: updateData,
	});

	return tag;
}

/**
 * Delete tag
 */
export async function deleteTag(tagId: string): Promise<void> {
	const tag = await prisma.tag.findUnique({
		where: { id: tagId },
	});

	if (!tag) {
		throw new Error('Tag nie istnieje');
	}

	await prisma.tag.delete({
		where: { id: tagId },
	});
}

/**
 * Assign tags to course
 */
export async function assignTagsToCourse(courseId: string, tagIds: string[]): Promise<void> {
	const course = await prisma.course.findUnique({
		where: { id: courseId },
	});

	if (!course) {
		throw new Error('Kurs nie istnieje');
	}

	const tags = await prisma.tag.findMany({
		where: { id: { in: tagIds } },
	});

	if (tags.length !== tagIds.length) {
		throw new Error('Niektóre tagi nie istnieją');
	}

	await prisma.courseTag.deleteMany({
		where: { courseId },
	});

	if (tagIds.length > 0) {
		await prisma.courseTag.createMany({
			data: tagIds.map(tagId => ({
				courseId,
				tagId,
			})),
		});
	}
}

/**
 * Add single tag to course
 */
export async function addTagToCourse(courseId: string, tagId: string): Promise<void> {
	const course = await prisma.course.findUnique({
		where: { id: courseId },
	});

	if (!course) {
		throw new Error('Kurs nie istnieje');
	}

	const tag = await prisma.tag.findUnique({
		where: { id: tagId },
	});

	if (!tag) {
		throw new Error('Tag nie istnieje');
	}

	const existingRelation = await prisma.courseTag.findUnique({
		where: {
			courseId_tagId: {
				courseId,
				tagId,
			},
		},
	});

	if (existingRelation) {
		throw new Error('Ten tag jest już przypisany do kursu');
	}

	await prisma.courseTag.create({
		data: {
			courseId,
			tagId,
		},
	});
}

/**
 * Remove tag from course
 */
export async function removeTagFromCourse(courseId: string, tagId: string): Promise<void> {
	const relation = await prisma.courseTag.findUnique({
		where: {
			courseId_tagId: {
				courseId,
				tagId,
			},
		},
	});

	if (!relation) {
		throw new Error('Tag nie jest przypisany do tego kursu');
	}

	await prisma.courseTag.delete({
		where: {
			courseId_tagId: {
				courseId,
				tagId,
			},
		},
	});
}

/**
 * Get tags for course
 */
export async function getTagsForCourse(courseId: string): Promise<TagDto[]> {
	const courseTags = await prisma.courseTag.findMany({
		where: { courseId },
		include: {
			tag: true,
		},
	});

	return courseTags.map(ct => ({
		id: ct.tag.id,
		name: ct.tag.name,
		slug: ct.tag.slug,
		description: ct.tag.description,
	}));
}
