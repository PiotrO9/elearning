import type { Video } from './Video'
import type { Tag } from './Admin'

export interface Course {
    id: string
    title: string
    description: string
    summary?: string
    descriptionMarkdown?: string
    instructors?: CourseInstructor[]
    thumbnail: string
    imagePath?: string
    tags?: Tag[]
    isPopular?: boolean
    isPublished?: boolean
    isPublic?: boolean
    videos?: Video[]
    createdAt?: string
    updatedAt?: string
}

export interface CourseInstructor {
    id: string
    username: string
}

export interface CourseListItem {
    id: string
    title: string
    description: string
    summary?: string
    instructors?: CourseInstructor[]
    thumbnail: string
    imagePath?: string
    tags?: Tag[]
    isPublished?: boolean
    isPublic?: boolean
    createdAt?: string
    updatedAt?: string
}

export interface CourseDetails extends Course {
    videos: Video[]
    tags: Tag[]
}
