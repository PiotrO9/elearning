export interface CourseListItemDto {
	id: string;
	title: string;
	description: string;
	imagePath: string;
}

export interface CourseDetailDto {
	id: string;
	title: string;
	description: string;
	imagePath: string;
	videos: import('./video').VideoDto[];
}

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
	videos: import('./video').Video[];
}

export interface CreateCourseInput {
	title: string;
	summary: string;
	descriptionMarkdown: string;
	imagePath: string;
	isPublished?: boolean;
}

export interface UpdateCourseInput {
	title?: string;
	summary?: string;
	descriptionMarkdown?: string;
	imagePath?: string;
	isPublished?: boolean;
}
