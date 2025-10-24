import type { Video } from '../types/Video'
import type { CourseDetails } from '../types/Course'

export function handleKeyboardAction(event: KeyboardEvent, callback: () => void) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    callback()
  }
}

export function getInitials(name: string) {
  if (!name) return ''

  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
}

/**
 * Filtruje video w kursie dla niezalogowanych użytkowników
 * Niezalogowani użytkownicy mogą widzieć tylko video z isTrailer: true
 * @param course - Szczegóły kursu
 * @param isAuthenticated - Czy użytkownik jest zalogowany
 * @returns Kurs z przefiltrowanymi video
 */
export function filterCourseVideos(
  course: CourseDetails,
  isAuthenticated: boolean
): CourseDetails {
  if (isAuthenticated) {
    return course
  }

  return {
    ...course,
    videos: course.videos.filter((video: Video) => video.isTrailer === true)
  }
}

/**
 * Sprawdza czy użytkownik ma dostęp do video
 * @param video - Video do sprawdzenia
 * @param isAuthenticated - Czy użytkownik jest zalogowany
 * @returns true jeśli użytkownik ma dostęp
 */
export function hasAccessToVideo(video: Video, isAuthenticated: boolean): boolean {
  if (isAuthenticated) {
    return true
  }

  return video.isTrailer === true
}

