import { ref } from 'vue'
import type { CourseListItem, CourseDetails } from '../types/Course'
import { getCourses, getCourseDetails, getCoursesByTag } from '../services/courseService'

export function useCourses() {
    const courses = ref<CourseListItem[]>([])
    const currentCourse = ref<CourseDetails | null>(null)
    const isLoading = ref(false)
    const error = ref<string | null>(null)

    /**
     * Pobiera wszystkie kursy
     * @param tag - Opcjonalny tag do filtrowania
     */
    async function fetchCourses(tag?: string): Promise<void> {
        isLoading.value = true
        error.value = null

        try {
            const response = await getCourses(tag ? { tag } : undefined)
            courses.value = response.courses
        } catch (err) {
            error.value = 'Nie udało się pobrać kursów'
            console.error('Error fetching courses:', err)
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Pobiera kursy z określonym tagiem
     * @param tag - Tag do filtrowania
     */
    async function fetchCoursesByTag(tag: string): Promise<void> {
        isLoading.value = true
        error.value = null

        try {
            const response = await getCoursesByTag(tag)
            courses.value = response.courses
        } catch (err) {
            error.value = 'Nie udało się pobrać kursów'
            console.error('Error fetching courses by tag:', err)
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Pobiera szczegóły kursu
     * @param id - ID kursu
     */
    async function fetchCourseDetails(id: number | string): Promise<void> {
        isLoading.value = true
        error.value = null

        try {
            const response = await getCourseDetails(id)
            currentCourse.value = response.course
        } catch (err) {
            error.value = 'Nie udało się pobrać szczegółów kursu'
            console.error('Error fetching course details:', err)
            currentCourse.value = null
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Resetuje aktualny kurs
     */
    function resetCurrentCourse(): void {
        currentCourse.value = null
    }

    /**
     * Resetuje błędy
     */
    function resetError(): void {
        error.value = null
    }

    return {
        courses,
        currentCourse,
        isLoading,
        error,
        fetchCourses,
        fetchCoursesByTag,
        fetchCourseDetails,
        resetCurrentCourse,
        resetError,
    }
}
