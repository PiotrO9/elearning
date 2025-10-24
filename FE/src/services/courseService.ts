import { httpClient } from '../utils'
import type { CourseListItem, CourseDetails } from '../types/Course'
import type { Video } from '../types/Video'

export interface GetCoursesParams {
  tag?: string
}

export interface GetCoursesResponse {
  courses: CourseListItem[]
  total: number
}

export interface GetCourseDetailsResponse {
  course: CourseDetails
}

interface ApiCourseListItem {
  id: string
  title: string
  description: string
  instructor: string
  imagePath: string
  tags: string[]
  isPublish: boolean
  createdAt: string
  updatedAt: string
}

interface ApiCoursesResponse {
  success: boolean
  data: {
    items: ApiCourseListItem[]
  }
  total: number
}

interface ApiCourseData {
  id: string
  title: string
  description: string
  instructor: string
  imagePath: string
  tags: string[]
  isPublish: boolean
  videos: Video[]
  createdAt?: string
  updatedAt?: string
}

interface ApiCourseDetailsResponse {
  success: boolean
  data: ApiCourseData
}

/**
 * Pobiera listę kursów
 * @param params - Parametry zapytania (opcjonalnie tag do filtrowania)
 * @returns Promise z listą kursów
 */
export async function getCourses(params?: GetCoursesParams): Promise<GetCoursesResponse> {
  const response = await httpClient.get<ApiCoursesResponse>('/course', {
    params,
  })

  const courses = response.data.data.items.map(item => ({
    id: item.id,
    title: item.title,
    description: item.description,
    instructor: item.instructor,
    thumbnail: item.imagePath,
    tags: item.tags || [],
    isPublished: item.isPublish,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }))

  return {
    courses,
    total: response.data.total
  }
}

/**
 * Pobiera szczegóły kursu
 * @param id - ID kursu
 * @returns Promise ze szczegółami kursu
 */
export async function getCourseDetails(id: number | string): Promise<GetCourseDetailsResponse> {
  const response = await httpClient.get<ApiCourseDetailsResponse>(`/course/${id}`)
  const apiData = response.data.data

  return {
    course: {
      id: apiData.id,
      title: apiData.title,
      description: apiData.description,
      instructor: apiData.instructor,
      thumbnail: apiData.imagePath,
      tags: apiData.tags || [],
      isPublished: apiData.isPublish,
      videos: apiData.videos || [],
      createdAt: apiData.createdAt,
      updatedAt: apiData.updatedAt,
    }
  }
}

/**
 * Pobiera kursy z określonym tagiem
 * @param tag - Tag do filtrowania
 * @returns Promise z listą kursów
 */
export async function getCoursesByTag(tag: string): Promise<GetCoursesResponse> {
  return getCourses({ tag })
}

