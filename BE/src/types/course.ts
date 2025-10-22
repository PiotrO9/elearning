export interface CourseListItemDto {
	id: string;
	title: string;
	description: string;
	imagePath: string;
	isPublic: boolean;
}

export interface CourseDetailDto {
	id: string;
	title: string;
	description: string;
	imagePath: string;
	isPublic: boolean;
	videos: import('./video').VideoDto[];
}

export interface CourseListItem {
	id: string;
	title: string;
	summary: string;
	imagePath: string;
	isPublic: boolean;
}

export interface CourseDetail {
	id: string;
	title: string;
	descriptionMarkdown: string;
	imagePath: string;
	isPublic: boolean;
	videos: import('./video').Video[];
}

export interface CreateCourseInput {
	title: string;
	summary: string;
	descriptionMarkdown: string;
	imagePath: string;
	isPublished?: boolean;
	isPublic?: boolean;
}

export interface UpdateCourseInput {
	title?: string;
	summary?: string;
	descriptionMarkdown?: string;
	imagePath?: string;
	isPublished?: boolean;
	isPublic?: boolean;
}
