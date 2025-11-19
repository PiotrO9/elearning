<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MaxWidthWrapper from '@/components/wrappers/MaxWidthWrapper.vue'
import AdminNav from '@/components/admin/AdminNav.vue'
import AdminTableHeader from '@/components/admin/table/AdminTableHeader.vue'
import Action from '@/components/ui/Action.vue'
import Icon from '@/components/ui/Icon.vue'
import { getCourses } from '@/services/courseService'
import { getUserCourses, enrollUserToCourse, unenrollUserFromCourse } from '@/services/adminService'
import type { CourseListItem } from '@/types/Course'

const route = useRoute()
const router = useRouter()

const userId = computed(() => route.params.userId as string)

const courses = ref<CourseListItem[]>([])
const enrolledCourseIds = ref<string[]>([])
const isLoading = ref(false)
const isLoadingCourses = ref(false)
const error = ref<string | null>(null)
const savingError = ref<string | null>(null)

async function fetchUserData() {
    // TODO: Pobierz dane użytkownika jeśli potrzebne
    // Na razie używamy tylko userId z route
}

async function fetchCourses() {
    isLoadingCourses.value = true
    error.value = null

    try {
        const response = await getCourses()
        courses.value = response.courses
    } catch (err: unknown) {
        const errorMessage = err && typeof err === 'object' && 'response' in err
            ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
            : err && typeof err === 'object' && 'message' in err
                ? String((err as { message: unknown }).message)
                : 'Wystąpił błąd podczas pobierania kursów'
        error.value = errorMessage || 'Wystąpił błąd podczas pobierania kursów'
        console.error('Error fetching courses:', err)
    } finally {
        isLoadingCourses.value = false
    }
}

async function fetchEnrolledCourses() {
    try {
        const response = await getUserCourses(userId.value)
        enrolledCourseIds.value = response.data.items.map(c => c.id.toString())
    } catch (err: unknown) {
        console.error('Error fetching enrolled courses:', err)
        enrolledCourseIds.value = []
    }
}

const isEnrolled = computed(() => (courseId: string) => {
    return enrolledCourseIds.value.includes(courseId.toString())
})

async function handleToggleEnrollment(courseId: string) {
    if (!userId.value) return

    savingError.value = null
    isLoading.value = true

    try {
        const courseIdStr = courseId.toString()
        const isCurrentlyEnrolled = isEnrolled.value(courseIdStr)

        if (isCurrentlyEnrolled) {
            await unenrollUserFromCourse(courseIdStr, userId.value)
            enrolledCourseIds.value = enrolledCourseIds.value.filter(id => id !== courseIdStr)
        } else {
            await enrollUserToCourse(courseIdStr, { userId: userId.value })
            enrolledCourseIds.value.push(courseIdStr)
        }
    } catch (err: unknown) {
        const errorMessage = err && typeof err === 'object' && 'response' in err
            ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
            : err && typeof err === 'object' && 'message' in err
                ? String((err as { message: unknown }).message)
                : 'Wystąpił błąd podczas zapisywania zmian'
        savingError.value = errorMessage || 'Wystąpił błąd podczas zapisywania zmian'
        console.error('Error toggling enrollment:', err)
    } finally {
        isLoading.value = false
    }
}

function handleBack() {
    router.push('/admin/users')
}

onMounted(async () => {
    await Promise.all([
        fetchUserData(),
        fetchCourses(),
        fetchEnrolledCourses()
    ])
})
</script>

<template>
<div class="min-h-screen bg-gray-50">
    <AdminNav />
    <MaxWidthWrapper class="py-8">
        <div class="mb-8">
            <div class="flex items-center gap-4 mb-4">
                <button
                    @click="handleBack"
                    class="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                    tabindex="0"
                    aria-label="Wróć do listy użytkowników"
                    @keydown="(e) => e.key === 'Enter' && handleBack()"
                >
                    <Icon
                        name="arrow-left"
                        class="w-6 h-6"
                    />
                </button>
                <AdminTableHeader
                    :title="`Zarządzanie kursami użytkownika`"
                    :description="`Przypisz lub usuń kursy dla użytkownika ID: ${userId}`"
                />
            </div>
        </div>

        <div v-if="error" class="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p class="text-sm text-red-700">{{ error }}</p>
        </div>

        <div v-if="savingError" class="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p class="text-sm text-red-700">{{ savingError }}</p>
        </div>

        <div v-if="isLoadingCourses" class="text-center py-12">
            <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"></div>
            <p class="mt-4 text-gray-600">Ładowanie kursów...</p>
        </div>

        <div v-else-if="courses.length === 0" class="text-center py-12 bg-white rounded-xl shadow-md">
            <p class="text-gray-500">Brak dostępnych kursów</p>
        </div>

        <div v-else class="space-y-3">
            <div
                v-for="course in courses"
                :key="course.id"
                class="bg-white rounded-xl shadow-md p-6 border-2 transition-all duration-200 hover:shadow-lg"
                :class="isEnrolled(course.id.toString()) ? 'border-blue-200 bg-blue-50' : 'border-gray-200'"
            >
                <div class="flex items-center justify-between">
                    <div class="flex-1">
                        <h3 class="text-lg font-semibold text-gray-900 mb-1">{{ course.title }}</h3>
                        <p v-if="course.summary" class="text-sm text-gray-600 line-clamp-2">{{ course.summary }}</p>
                        <div class="flex items-center gap-4 mt-3">
                            <span
                                v-if="course.isPublished"
                                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700"
                            >
                                <Icon
                                    name="check"
                                    class="w-3.5 h-3.5"
                                />
                                Opublikowany
                            </span>
                            <span
                                v-else
                                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                            >
                                <Icon
                                    name="close"
                                    class="w-3.5 h-3.5"
                                />
                                Nieopublikowany
                            </span>
                            <span
                                v-if="isEnrolled(course.id.toString())"
                                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700"
                            >
                                <Icon
                                    name="check"
                                    class="w-3.5 h-3.5"
                                />
                                Przypisany
                            </span>
                        </div>
                    </div>
                    <div class="ml-6">
                        <Action
                            @click="handleToggleEnrollment(course.id.toString())"
                            :variant="isEnrolled(course.id.toString()) ? 'danger' : 'primary'"
                            size="md"
                            :disabled="isLoading"
                            :aria-label="isEnrolled(course.id.toString()) ? 'Usuń z kursu' : 'Przypisz do kursu'"
                        >
                            <Icon
                                v-if="isEnrolled(course.id.toString())"
                                name="close"
                                class="w-5 h-5 mr-2"
                            />
                            <Icon
                                v-else
                                name="plus"
                                class="w-5 h-5 mr-2"
                            />
                            {{ isEnrolled(course.id.toString()) ? 'Usuń z kursu' : 'Przypisz do kursu' }}
                        </Action>
                    </div>
                </div>
            </div>
        </div>
    </MaxWidthWrapper>
</div>
</template>

