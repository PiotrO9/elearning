export interface Tag {
	id: string;
	name: string;
	slug: string;
	description?: string | null;
	createdAt: Date;
	updatedAt: Date;
}

export interface TagDto {
	id: string;
	name: string;
	slug: string;
	description?: string | null;
	coursesCount?: number;
}

export interface CreateTagInput {
	name: string;
	slug?: string;
	description?: string;
}

export interface UpdateTagInput {
	name?: string;
	slug?: string;
	description?: string;
}

export interface TagWithCourses extends Tag {
	courses: {
		id: string;
		courseId: string;
		tagId: string;
		course: {
			id: string;
			title: string;
			summary: string;
			imagePath: string;
		};
	}[];
}

export interface AssignTagsToCourseInput {
	courseId: string;
	tagIds: string[];
}
