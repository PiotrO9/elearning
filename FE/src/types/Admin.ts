import type { Course, CourseListItem } from './Course'
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
  }
}

export interface ApiTagsResponse {
  success: boolean
  data: Tag[]
}

