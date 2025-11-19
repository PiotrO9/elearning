import { TagDto } from './tag';
import { VideoDto, Video } from './video';

export interface CourseListItemDto {
	id: string;
	title: string;
	description: string;
	imagePath: string;
	isPublic: boolean;
	tags?: import('./tag').TagDto[];
}

export interface CourseDetailDto {
	id: string;
	title: string;
	description: string;
	imagePath: string;
	isPublic: boolean;
	videos: VideoDto[];
	tags?: TagDto[];
}

export interface CourseListItem {
	id: string;
	title: string;
	summary: string;
	imagePath: string;
	isPublic: boolean;
	tags?: TagDto[];
}

export interface CourseDetail {
	id: string;
	title: string;
	descriptionMarkdown: string;
	imagePath: string;
	isPublic: boolean;
	videos: Video[];
	tags?: TagDto[];
}

export interface CreateCourseInput {
	title: string;
	summary: string;
	descriptionMarkdown: string;
	imagePath: string;
	isPublished?: boolean;
	isPublic?: boolean;
	tagIds?: string[];
}

export interface UpdateCourseInput {
	title?: string;
	summary?: string;
	descriptionMarkdown?: string;
	imagePath?: string;
	isPublished?: boolean;
	isPublic?: boolean;
	tagIds?: string[];
}
