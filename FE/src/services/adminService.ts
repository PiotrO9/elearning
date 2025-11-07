import { httpClient } from '../utils'
import type {
  Tag,
  CreateTagInput,
  UpdateTagInput,
  CreateCourseInput,
  UpdateCourseInput,
  CreateVideoInput,
  UpdateVideoInput,
  VideoReorderItem,
  EnrollmentUser,
  EnrollUserInput,
  ApiResponse,
  ApiListResponse,
  ApiTagsResponse,
  DashboardStats,
} from '../types/Admin'
import type { CourseListItem, CourseDetails } from '../types/Course'
import type { User, UserAdminPanelListItem } from '../types/user'

// ==================== KURSY ====================

/**
 * Utwórz nowy kurs
 */
export async function createCourse(data: CreateCourseInput): Promise<ApiResponse<CourseDetails>> {
  const response = await httpClient.post<ApiResponse<CourseDetails>>('/course', data)
  return response.data
}

/**
 * Zaktualizuj kurs
 */
export async function updateCourse(
  id: string,
  data: UpdateCourseInput
): Promise<ApiResponse<CourseDetails>> {
  const response = await httpClient.patch<ApiResponse<CourseDetails>>(`/course/${id}`, data)
  return response.data
}

/**
 * Usuń kurs
 */
export async function deleteCourse(id: string): Promise<void> {
  await httpClient.delete(`/course/${id}`)
}

/**
 * Zmień kolejność wideo w kursie
 */
export async function reorderCourseVideos(
  courseId: string,
  items: VideoReorderItem[]
): Promise<void> {
  await httpClient.post(`/course/${courseId}/videos/reorder`, { items })
}

// ==================== TAGI ====================

/**
 * Pobierz wszystkie tagi z paginacją
 */
export async function getTags(params?: { page?: number; limit?: number }): Promise<ApiListResponse<Tag>> {
  const response = await httpClient.get<ApiListResponse<Tag>>('/tags', {
    params: {
      page: params?.page || 1,
      limit: params?.limit || 10
    }
  })
  return response.data
}

/**
 * Pobierz tag po ID
 */
export async function getTagById(id: string): Promise<Tag> {
  const response = await httpClient.get<ApiResponse<Tag>>(`/tags/${id}`)
  return response.data.data!
}

/**
 * Pobierz tagi dla kursu
 */
export async function getCourseTags(courseId: string): Promise<Tag[]> {
  const response = await httpClient.get<ApiTagsResponse>(`/tags/course/${courseId}`)
  return response.data.data
}

/**
 * Utwórz nowy tag
 */
export async function createTag(data: CreateTagInput): Promise<ApiResponse<Tag>> {
  const response = await httpClient.post<ApiResponse<Tag>>('/tags', data)
  return response.data
}

/**
 * Zaktualizuj tag
 */
export async function updateTag(id: string, data: UpdateTagInput): Promise<ApiResponse<Tag>> {
  const response = await httpClient.patch<ApiResponse<Tag>>(`/tags/${id}`, data)
  return response.data
}

/**
 * Usuń tag
 */
export async function deleteTag(id: string): Promise<ApiResponse<null>> {
  const response = await httpClient.delete<ApiResponse<null>>(`/tags/${id}`)
  return response.data
}

/**
 * Przypisz tagi do kursu (zastąp wszystkie)
 */
export async function assignTagsToCourse(
  courseId: string,
  tagIds: string[]
): Promise<ApiResponse<null>> {
  const response = await httpClient.put<ApiResponse<null>>(`/tags/course/${courseId}`, { tagIds })
  return response.data
}

/**
 * Dodaj jeden tag do kursu
 */
export async function addTagToCourse(
  courseId: string,
  tagId: string
): Promise<ApiResponse<null>> {
  const response = await httpClient.post<ApiResponse<null>>(
    `/tags/course/${courseId}/tag/${tagId}`
  )
  return response.data
}

/**
 * Usuń tag z kursu
 */
export async function removeTagFromCourse(
  courseId: string,
  tagId: string
): Promise<ApiResponse<null>> {
  const response = await httpClient.delete<ApiResponse<null>>(
    `/tags/course/${courseId}/tag/${tagId}`
  )
  return response.data
}

// ==================== WIDEO ====================

/**
 * Utwórz nowe wideo
 */
export async function createVideo(data: CreateVideoInput): Promise<ApiResponse<{ id: string }>> {
  const response = await httpClient.post<ApiResponse<{ id: string }>>('/video', data)
  return response.data
}

/**
 * Zaktualizuj wideo
 */
export async function updateVideo(id: string, data: UpdateVideoInput): Promise<void> {
  await httpClient.patch(`/video/${id}`, data)
}

/**
 * Usuń wideo
 */
export async function deleteVideo(id: string): Promise<void> {
  await httpClient.delete(`/video/${id}`)
}

/**
 * Przypisz wideo do kursu
 */
export async function attachVideoToCourse(
  videoId: string,
  courseId: string,
  data?: { order?: number; isTrailer?: boolean }
): Promise<void> {
  await httpClient.post(`/video/${videoId}/attach/${courseId}`, data)
}

/**
 * Odepnij wideo od kursu (usuwa wideo)
 */
export async function detachVideo(videoId: string): Promise<void> {
  await httpClient.post(`/video/${videoId}/detach`)
}

// ==================== UŻYTKOWNICY I ENROLLMENTS ====================

/**
 * Przypisz użytkownika do kursu (admin)
 */
export async function enrollUserToCourse(
  courseId: string,
  data: EnrollUserInput
): Promise<ApiResponse<null>> {
  const response = await httpClient.post<ApiResponse<null>>(`/courses/${courseId}/enroll`, data)
  return response.data
}

/**
 * Usuń użytkownika z kursu
 */
export async function unenrollUserFromCourse(courseId: string, userId: string): Promise<void> {
  await httpClient.delete(`/courses/${courseId}/enrollments/${userId}`)
}

/**
 * Pobierz listę użytkowników na kursie
 */
export async function getCourseEnrollments(
  courseId: string
): Promise<ApiListResponse<EnrollmentUser>> {
  const response = await httpClient.get<ApiListResponse<EnrollmentUser>>(
    `/courses/${courseId}/enrollments`
  )
  return response.data
}

/**
 * Pobierz kursy użytkownika
 */
export async function getUserCourses(userId: string): Promise<ApiListResponse<CourseListItem>> {
  const response = await httpClient.get<ApiListResponse<CourseListItem>>(`/users/${userId}/courses`)
  return response.data
}

// ==================== POMOCNICZE ====================

/**
 * Pobierz statystyki dashboardu
 */
export async function getDashboard(): Promise<ApiResponse<DashboardStats>> {
  const response = await httpClient.get<ApiResponse<DashboardStats>>('/admin/dashboard')
  return response.data
}

/**
 * Pobierz wszystkich użytkowników z paginacją
 */
export async function getAllUsers(params?: { page?: number; limit?: number }): Promise<ApiListResponse<UserAdminPanelListItem>> {
  const response = await httpClient.get<ApiListResponse<UserAdminPanelListItem>>('/users', {
    params: {
      page: params?.page || 1,
      limit: params?.limit || 10
    }
  })

  return response.data
}

/**
 * Zmień rolę użytkownika
 */
export async function updateUserRole(
  userId: string,
  role: 'USER' | 'ADMIN'
): Promise<ApiResponse<{ user: User }>> {
  const response = await httpClient.patch<ApiResponse<{ user: User }>>(`/users/${userId}/role`, {
    role
  })
  return response.data
}

