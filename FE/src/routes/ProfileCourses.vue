<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { httpClient } from '@/utils'
import MaxWidthWrapper from '../components/wrappers/MaxWidthWrapper.vue'
import CourseCard from '../components/course/CourseCard.vue'
import { Icon } from '@iconify/vue'
import { useHead } from '@vueuse/head'
import type { CourseInstructor, CourseListItem } from '@/types/Course'

const router = useRouter()
const authStore = useAuthStore()

const courses = ref<CourseListItem[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)
const searchQuery = ref<string>('')
const selectedTag = ref<number>()

const filteredCourses = computed(() => {
    if (!courses.value) return []

    return courses.value.filter((course) => {
        const matchesSearch =
            course.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            course.description.toLowerCase().includes(searchQuery.value.toLowerCase())
        const matchesTag =
            selectedTag.value === undefined ||
            course.tags?.some((tag) => tag.id.toString() === selectedTag.value?.toString())
        return matchesSearch && matchesTag
    })
})

async function fetchUserCourses() {
    if (!authStore.user?.id) {
        console.log('No user ID available yet, authStore.user:', authStore.user)
        error.value = 'Nie można załadować kursów - brak danych użytkownika'
        return
    }

    isLoading.value = true
    error.value = null

    try {
        console.log('Fetching courses for user ID:', authStore.user.id)

        const response = await httpClient.get<{
            success: boolean
            data: {
                user: {
                    id: string
                    username: string
                    email: string
                    role: string
                    createdAt: string
                    lastSeen: string | null
                }
                courses: Array<{
                    id: string
                    title: string
                    description?: string
                    summary: string
                    imagePath: string
                    isPublic: boolean
                    enrolledAt: string
                    tags: Array<{
                        id: string
                        name: string
                        slug: string
                        description?: string
                        createdAt: string
                    }>
                    instructors: CourseInstructor[]
                }>
                pagination: {
                    currentPage: number
                    totalPages: number
                    totalItems: number
                    limit: number
                }
            }
        }>(`/courses/users/${authStore.user.id}/courses`)

        console.log('Response:', response.data)

        // Mapuj response na CourseListItem
        courses.value = response.data.data.courses.map((course) => ({
            id: course.id,
            title: course.title,
            description: course.description || course.summary,
            summary: course.summary,
            thumbnail: course.imagePath,
            imagePath: course.imagePath,
            instructors: course.instructors,
            tags: course.tags,
            isPublished: true,
            isPublic: course.isPublic,
        }))
    } catch (err: any) {
        error.value = err.response?.data?.message || err.message || 'Nie udało się pobrać kursów'
        console.error('Error fetching user courses:', err)
    } finally {
        isLoading.value = false
    }
}

function handleCourseClick(courseId: string) {
    router.push(`/courses/${courseId}`)
}

async function handleRetry() {
    // Spróbuj ponownie załadować użytkownika
    if (!authStore.user) {
        await authStore.fetchUser()
    }
    await fetchUserCourses()
}

function selectTag(tagId: number) {
    selectedTag.value = selectedTag.value === tagId ? undefined : tagId
}

const tags = [
    { name: 'Frontend', id: 0 },
    { name: 'Backend', id: 1 },
    { name: 'UI/UX', id: 2 },
    { name: 'JavaScript', id: 3 },
    { name: 'Python', id: 4 },
]

onMounted(async () => {
    console.log('onMounted - authStore.user:', authStore.user)
    // Jeśli użytkownik nie jest załadowany, poczekaj chwilę i spróbuj ponownie
    if (!authStore.user) {
        isLoading.value = true
        await authStore.fetchUser()
        console.log('After fetchUser - authStore.user:', authStore.user)
    }

    // Spróbuj załadować kursy
    await fetchUserCourses()
})

// Backup watch na wypadek gdyby user załadował się później
watch(
    () => authStore.user,
    (user) => {
        console.log('watch triggered, user:', user, 'courses.length:', courses.value.length)
        if (user && courses.value.length === 0 && !isLoading.value && !error.value) {
            fetchUserCourses()
        }
    },
)

useHead({
    title: 'Moje Kursy - E-Learning Platforma',
})
</script>

<template>
    <div class="min-h-screen bg-gray-50 py-12">
        <MaxWidthWrapper>
            <div class="mb-12">
                <h1 class="text-4xl font-bold text-gray-900 mb-4">Moje Kursy</h1>
                <p class="text-lg text-gray-600">Kontynuuj naukę i rozwijaj swoje umiejętności</p>
            </div>

            <div v-if="isLoading" class="text-center py-20">
                <div
                    class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary"
                ></div>
                <p class="mt-4 text-gray-600">Ładowanie kursów...</p>
            </div>

            <div v-else-if="error" class="text-center py-20">
                <div class="text-6xl mb-4">⚠️</div>
                <h3 class="text-2xl font-bold text-gray-900 mb-2">Wystąpił błąd</h3>
                <p class="text-gray-600 mb-4">{{ error }}</p>
                <button
                    @click="handleRetry"
                    class="px-6 py-3 bg-primary text-white rounded-lg hover:bg-button-primary-hover transition-colors"
                >
                    Spróbuj ponownie
                </button>
            </div>

            <template v-else>
                <div class="mb-4 relative flex items-center">
                    <input
                        v-model="searchQuery"
                        type="text"
                        placeholder="Szukaj kursu..."
                        class="w-full px-6 py-4 text-lg text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        aria-label="Wyszukaj kurs"
                    />
                    <button
                        class="absolute cursor-pointer right-4 bg-primary hover:bg-button-primary-hover duration-300 px-3 py-2 rounded-md text-text-on-dark text-3xl"
                    >
                        <Icon icon="material-symbols:search" />
                    </button>
                </div>

                <div class="mb-8 flex justify-start items-center gap-3 text-sm flex-wrap">
                    <button
                        @click="selectTag(tag.id)"
                        v-for="tag in tags"
                        :key="tag.name"
                        :class="
                            (tag.id === selectedTag
                                ? 'bg-primary text-text-on-dark'
                                : 'bg-primary/10 text-primary') +
                            ' hover:bg-secondary hover:text-text-secondary duration-300 px-4 py-1 rounded-full'
                        "
                    >
                        {{ tag.name }}
                    </button>
                </div>

                <div class="mb-6">
                    <p class="text-gray-600">
                        Znaleziono
                        <span class="font-semibold">{{ filteredCourses.length }}</span>
                        {{ filteredCourses.length === 1 ? 'kurs' : 'kursów' }}
                    </p>
                </div>

                <div v-if="courses.length === 0" class="text-center py-20">
                    <div class="text-6xl mb-4">📚</div>
                    <h3 class="text-2xl font-bold text-gray-900 mb-2">
                        Nie masz jeszcze żadnych kursów
                    </h3>
                    <p class="text-gray-600 mb-6">
                        Zacznij swoją przygodę edukacyjną i zapisz się na kurs!
                    </p>
                    <button
                        @click="router.push('/courses')"
                        class="px-6 py-3 bg-primary text-white rounded-lg hover:bg-button-primary-hover transition-colors"
                    >
                        Przeglądaj Kursy
                    </button>
                </div>

                <div v-else-if="filteredCourses.length === 0" class="text-center py-20">
                    <div class="text-6xl mb-4">🔍</div>
                    <h3 class="text-2xl font-bold text-gray-900 mb-2">Nie znaleziono kursów</h3>
                    <p class="text-gray-600">
                        Spróbuj zmienić kryteria wyszukiwania lub wybierz inną kategorię
                    </p>
                </div>

                <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <CourseCard
                        v-for="course in filteredCourses"
                        :key="course.id"
                        :course="course"
                        @click="handleCourseClick"
                    />
                </div>
            </template>
        </MaxWidthWrapper>
    </div>
</template>
