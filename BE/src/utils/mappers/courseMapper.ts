import { CourseDetailDto } from '../../types/course';
import { CourseDetail } from '../../types/course';
import { VideoDto } from '../../types/video';

/**
 * Mapuje CourseDetail (z serwisu) na CourseDetailDto (dla API)
 */
export function mapCourseToDetailDto(course: CourseDetail): CourseDetailDto {
	return {
		id: course.id,
		title: course.title,
		description: course.descriptionMarkdown,
		imagePath: course.imagePath,
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
