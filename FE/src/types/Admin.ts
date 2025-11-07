import type { Course, CourseListItem } from './Course'
import type { UserAdminPanelListItem } from './user'
import type { Video } from './Video'

// Tag types
export interface Tag {
  id: string
  name: string
  slug: string
  description?: string
  coursesCount?: number
}

export interface CreateTagInput {
  name: string
  slug?: string
  description?: string
}

export interface UpdateTagInput {
  name?: string
  slug?: string
  description?: string
}

// Course types for admin
export interface CreateCourseInput {
  title: string
  summary: string
  descriptionMarkdown: string
  imagePath: string
  isPublished?: boolean
  isPublic?: boolean
}

export interface UpdateCourseInput {
  title?: string
  summary?: string
  descriptionMarkdown?: string
  imagePath?: string
  isPublished?: boolean
  isPublic?: boolean
}

// Video types
export interface CreateVideoInput {
  title: string
  order: number
  isTrailer?: boolean
  sourceUrl: string
  durationSeconds?: number
}

export interface UpdateVideoInput {
  courseId?: string
  title?: string
  order?: number
  isTrailer?: boolean
  sourceUrl?: string
  durationSeconds?: number
}

export interface VideoReorderItem {
  id: string
  order: number
}

// Enrollment types
export interface EnrollmentUser {
  id: string
  userId: string
  username: string
  email: string
  enrolledAt: string
  enrolledBy?: string | null
}

export interface EnrollUserInput {
  userId: string
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
}

export interface ApiListResponse<T> {
  success: boolean
  data: {
    items: T[]
    total: number
    pagination: Pagination
  }
}

export interface Pagination {
  currentPage: number
  limit: number
  totalPages: number
  totalItems: number
}

export interface ApiTagsResponse {
  success: boolean
  data: Tag[]
}

export type UsersListsResponse = ApiResponse<{
  users: UserAdminPanelListItem[]
  pagination: UsersePagination
}>

export interface UsersePagination {
  currentPage: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
  totalUsers: number
}

export interface DashboardStats {
  metrics: {
    activeCourses: number
    totalCourses: number
    totalTags: number
    totalUsers: number
  },
  recentActivities: {
    description: string
    timeAgo: string
    timestamp: string
    type: 'course_added' | 'course_updated' | 'tag_added' | 'tag_updated' | 'user_registered';
  }[]
}
