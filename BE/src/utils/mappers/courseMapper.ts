import { CourseDetailDto } from '../../types/course';
import { CourseDetail } from '../../types/course';
import { VideoDto } from '../../types/video';
import { getPublicUrl, BUCKET_COURSES } from '../minio';

function convertImagePathToUrl(imagePath: string | null | undefined): string | null | undefined {
	if (!imagePath) {
		return imagePath;
	}
	return imagePath.startsWith('http') ? imagePath : getPublicUrl(BUCKET_COURSES, imagePath);
}

/**
 * Mapuje CourseDetail (z serwisu) na CourseDetailDto (dla API)
 */
export function mapCourseToDetailDto(course: CourseDetail): CourseDetailDto {
	const imageUrl = convertImagePathToUrl(course.imagePath);

	return {
		id: course.id,
		title: course.title,
		description: course.descriptionMarkdown,
		imagePath: imageUrl,
		isPublic: course.isPublic,
		videos: course.videos.map(v => ({
			id: v.id,
			courseId: v.courseId,
			title: v.title,
			order: v.order,
			isTrailer: v.isTrailer,
			sourceUrl: v.sourceUrl,
			durationSeconds: v.durationSeconds,
		})) as VideoDto[],
		tags: course.tags,
		instructors: course.instructors,
	};
}
