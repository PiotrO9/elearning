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
