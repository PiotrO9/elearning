export interface CourseListItemDto {
	id: string;
	title: string;
	description: string; // maps to summary
	image_path: string; // maps to imagePath
}

export interface CourseDetailDto {
	id: string;
	title: string;
	description: string; // maps to descriptionMarkdown
	image_path: string; // maps to imagePath
	videos: string[]; // array of video IDs
}

// Domain types used inside services
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
