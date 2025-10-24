import type { Video } from './Video'

export interface Course {
  id: number | string
  title: string
  description: string
  instructor: string
  thumbnail: string
  tags: string[]
  isPopular?: boolean
  isPublished?: boolean
  videos?: Video[]
  createdAt?: string
  updatedAt?: string
}

export interface CourseListItem {
  id: number | string
  title: string
  description: string
  instructor: string
  thumbnail: string
  tags: string[]
  isPublished: boolean
  createdAt: string
  updatedAt: string
}

export interface CourseDetails extends Course {
  videos: Video[]
}

