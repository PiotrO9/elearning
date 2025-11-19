<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCourses } from '../composables/useCourses'
import { useAuthStore } from '../stores/auth'
import { filterCourseVideos, hasAccessToVideo } from '../utils/courseUtils'
import MaxWidthWrapper from '../components/wrappers/MaxWidthWrapper.vue'
import UserAvatar from '../components/course/UserAvatar.vue'
import { useHead } from '@vueuse/head'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { currentCourse, isLoading, error, fetchCourseDetails } = useCourses()

const courseId = computed(() => route.params.id as string)

const filteredCourse = computed(() => {
    if (!currentCourse.value) return null
    return filterCourseVideos(currentCourse.value, authStore.isAuthenticated)
})

const videos = computed(() => filteredCourse.value?.videos || [])

function handleGoBack() {
    router.push('/courses')
}

function handleEnroll() {
    if (!authStore.isAuthenticated) {
        router.push('/login')
        return
    }
    console.log('Enrolling in course:', courseId.value)
    // TODO: Implement enrollment logic
}

function handleVideoClick(videoId: number) {
    const video = videos.value.find((v) => v.id === videoId)
    if (!video) return

    if (!hasAccessToVideo(video, authStore.isAuthenticated)) {
        router.push('/login')
        return
    }

    console.log('Playing video:', videoId)
    // TODO: Implement video player
}

async function handleRetry() {
    await fetchCourseDetails(courseId.value)
}

onMounted(async () => {
    await fetchCourseDetails(courseId.value)
    useHead({
        title: filteredCourse.value
            ? `${filteredCourse.value.title} - E-Learning Platforma`
            : 'Szczegóły Kursu - E-Learning Platforma',
    })
})
</script>

<template>
    <div class="min-h-screen bg-gray-50 py-8">
        <MaxWidthWrapper>
            <div v-if="isLoading" class="text-center py-20">
                <div
                    class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"
                ></div>
                <p class="mt-4 text-gray-600">Ładowanie kursu...</p>
            </div>

            <div v-else-if="error" class="text-center py-20">
                <div class="text-6xl mb-4">⚠️</div>
                <h3 class="text-2xl font-bold text-gray-900 mb-2">Wystąpił błąd</h3>
                <p class="text-gray-600 mb-4">{{ error }}</p>
                <div class="flex gap-4 justify-center">
                    <button
                        @click="handleRetry"
                        class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Spróbuj ponownie
                    </button>
                    <button
                        @click="handleGoBack"
                        class="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                        Wróć do listy kursów
                    </button>
                </div>
            </div>

            <div v-else-if="!filteredCourse" class="text-center py-20">
                <div class="text-6xl mb-4">😕</div>
                <h2 class="text-3xl font-bold text-gray-900 mb-4">Nie znaleziono kursu</h2>
                <p class="text-gray-600 mb-8">Kurs o podanym ID nie istnieje</p>
                <button
                    class="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    @click="handleGoBack"
                >
                    Wróć do listy kursów
                </button>
            </div>

            <div v-else>
                <nav class="mb-6" aria-label="Breadcrumb">
                    <ol class="flex items-center space-x-2 text-sm text-gray-600">
                        <li>
                            <button
                                class="hover:text-blue-600 transition-colors"
                                @click="handleGoBack"
                                aria-label="Wróć do listy kursów"
                            >
                                Kursy
                            </button>
                        </li>
                        <li>/</li>
                        <li class="text-gray-900 font-medium">{{ filteredCourse.title }}</li>
                    </ol>
                </nav>

                <div class="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
                    <div class="grid lg:grid-cols-2 gap-8">
                        <div class="p-8 lg:p-12">
                            <h1 class="text-4xl font-bold text-gray-900 mb-4">
                                {{ filteredCourse.title }}
                            </h1>

                            <p class="text-lg text-gray-600 mb-6">
                                {{ filteredCourse.description }}
                            </p>

                            <div class="flex items-center mb-6">
                                <UserAvatar :name="filteredCourse.instructor" class="bg-blue-300" />
                                <div class="ml-4">
                                    <p class="text-sm text-gray-500">Instruktor</p>
                                    <p class="font-semibold text-gray-900">
                                        {{ filteredCourse.instructor }}
                                    </p>
                                </div>
                            </div>

                            <div class="space-y-3 mb-6">
                                <div class="flex items-center text-gray-700">
                                    <span class="mr-3">📹</span>
                                    <span>{{ videos.length }} materiałów wideo</span>
                                </div>
                                <div class="flex items-center text-gray-700">
                                    <span class="mr-3">📱</span>
                                    <span>Dostęp na telefonie i komputerze</span>
                                </div>
                                <div class="flex items-center text-gray-700">
                                    <span class="mr-3">🔄</span>
                                    <span>Dostęp bezterminowy</span>
                                </div>
                                <div class="flex items-center text-gray-700">
                                    <span class="mr-3">🎓</span>
                                    <span>Certyfikat ukończenia</span>
                                </div>
                            </div>

                            <div class="flex flex-wrap gap-2 mt-6">
                                <span
                                    v-for="tag in filteredCourse.tags"
                                    :key="tag.id"
                                    class="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium"
                                >
                                    {{ tag.name }}
                                </span>
                            </div>
                        </div>

                        <div
                            class="bg-gradient-to-br from-blue-50 to-purple-50 p-8 lg:p-12 flex flex-col justify-center"
                        >
                            <div>
                                <img
                                    :src="filteredCourse.thumbnail"
                                    :alt="`Miniatura kursu ${filteredCourse.title}`"
                                    class="w-full rounded-xl shadow-lg mb-6"
                                />
                            </div>

                            <button
                                class="w-full bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
                                @click="handleEnroll"
                                aria-label="Zapisz się na kurs"
                            >
                                Rozpocznij naukę
                            </button>
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div class="p-8 border-b border-gray-200">
                        <h2 class="text-2xl font-bold text-gray-900">
                            Materiały wideo ({{ videos.length }})
                        </h2>
                    </div>

                    <div class="divide-y divide-gray-200">
                        <div
                            v-for="(video, index) in videos"
                            :key="video.id"
                            class="px-8 py-5 hover:bg-gray-50 transition-colors cursor-pointer group"
                            @click="handleVideoClick(video.id)"
                        >
                            <div class="flex items-center justify-between">
                                <div class="flex items-center flex-1">
                                    <div
                                        class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold mr-4"
                                    >
                                        {{ index + 1 }}
                                    </div>
                                    <div class="flex-1">
                                        <h3
                                            class="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-1"
                                        >
                                            {{ video.title }}
                                        </h3>
                                        <div class="flex items-center gap-4 text-sm text-gray-500">
                                            <span class="flex items-center">
                                                <span class="mr-1">🕒</span>
                                                {{ video.duration }}
                                            </span>
                                            <span
                                                v-if="video.isCompleted"
                                                class="flex items-center text-green-600"
                                            >
                                                <span class="mr-1">✅</span>
                                                Ukończono
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div class="flex items-center gap-3">
                                    <span
                                        v-if="video.isTrailer || video.isFree"
                                        class="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium"
                                    >
                                        Darmowy podgląd
                                    </span>
                                    <span
                                        v-else-if="!authStore.isAuthenticated"
                                        class="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-medium"
                                    >
                                        Wymagane logowanie
                                    </span>
                                    <button
                                        class="w-10 h-10 rounded-full flex items-center justify-center text-white transition-colors"
                                        :class="
                                            hasAccessToVideo(video, authStore.isAuthenticated)
                                                ? 'bg-blue-600 hover:bg-blue-700'
                                                : 'bg-gray-400 hover:bg-gray-500'
                                        "
                                        :aria-label="`Odtwórz wideo ${video.title}`"
                                    >
                                        <span class="text-lg">▶</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MaxWidthWrapper>
    </div>
</template>
