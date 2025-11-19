import type { Video } from './Video'
import type { Tag } from './Admin'

export interface Course {
  id: number | string
  title: string
  description: string
  summary?: string
  descriptionMarkdown?: string
  instructor?: string
  thumbnail: string
  imagePath?: string
  tags?: Tag[] | string[]
  isPopular?: boolean
  isPublished?: boolean
  isPublic?: boolean
  videos?: Video[]
  createdAt?: string
  updatedAt?: string
}

export interface CourseListItem {
  id: number | string
  title: string
  description: string
  summary?: string
  instructor?: string
  thumbnail: string
  imagePath?: string
  tags?: Tag[] | string[]
  isPublished?: boolean
  isPublic?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface CourseDetails extends Course {
  videos: Video[]
  tags: Tag[]
}

