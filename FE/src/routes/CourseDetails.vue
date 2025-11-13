<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCourses } from '../composables/useCourses'
import type { Video } from '../types/Video'
import MaxWidthWrapper from '../components/wrappers/MaxWidthWrapper.vue'
import UserAvatar from '../components/course/UserAvatar.vue'
import { useHead } from '@vueuse/head'

const route = useRoute()
const router = useRouter()
const { getCourseById } = useCourses()

const courseId = computed(() => Number(route.params.id))
const course = computed(() => getCourseById(courseId.value))

const videos: Video[] = [
    {
        id: 1,
        title: 'Wprowadzenie do kursu - omówienie materiałów',
        duration: '8:45',
        isFree: true,
    },
    { id: 2, title: 'Instalacja i konfiguracja środowiska', duration: '12:30', isFree: true },
    { id: 3, title: 'Pierwsze kroki - Hello World', duration: '15:20' },
    { id: 4, title: 'Podstawy składni i struktury', duration: '22:15' },
    { id: 5, title: 'Praca z komponentami', duration: '28:40' },
    { id: 6, title: 'Zarządzanie stanem aplikacji', duration: '31:25' },
    { id: 7, title: 'Routing i nawigacja', duration: '25:10' },
    { id: 8, title: 'API i komunikacja z backendem', duration: '35:50' },
    { id: 9, title: 'Formularze i walidacja', duration: '27:35' },
    { id: 10, title: 'Zaawansowane wzorce projektowe', duration: '40:20' },
    { id: 11, title: 'Optymalizacja wydajności', duration: '33:15' },
    { id: 12, title: 'Testowanie aplikacji', duration: '38:45' },
    { id: 13, title: 'Deployment i CI/CD', duration: '29:30' },
    { id: 14, title: 'Projekt praktyczny - część 1', duration: '45:10' },
    { id: 15, title: 'Projekt praktyczny - część 2', duration: '42:25' },
    { id: 16, title: 'Projekt praktyczny - część 3', duration: '48:15' },
    { id: 17, title: 'Podsumowanie i dalsze kroki', duration: '18:30' },
]

function handleGoBack() {
    router.push('/courses')
}

function handleEnroll() {
    console.log('Enrolling in course:', courseId.value)
    // TODO: Implement enrollment logic
}

function handleVideoClick(videoId: number) {
    console.log('Playing video:', videoId)
    // TODO: Implement video player
}

useHead({
    title: course.value
        ? `${course.value.title} - E-Learning Platforma`
        : 'Nie znaleziono kursu - E-Learning Platforma',
})
</script>

<template>
    <div class="min-h-screen bg-gray-50 py-8">
        <MaxWidthWrapper>
            <div v-if="!course" class="text-center py-20">
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
                        <li class="text-gray-900 font-medium">{{ course.title }}</li>
                    </ol>
                </nav>

                <div class="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
                    <div class="grid lg:grid-cols-2 gap-8">
                        <div class="p-8 lg:p-12">
                            <h1 class="text-4xl font-bold text-gray-900 mb-4">
                                {{ course.title }}
                            </h1>

                            <p class="text-lg text-gray-600 mb-6">
                                {{ course.description }}
                            </p>

                            <div class="flex items-center mb-6">
                                <UserAvatar :name="course.instructor" />
                                <div class="ml-4">
                                    <p class="text-sm text-gray-500">Instruktor</p>
                                    <p class="font-semibold text-gray-900">
                                        {{ course.instructor }}
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
                                    v-for="tag in course.tags"
                                    :key="tag"
                                    class="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium"
                                >
                                    {{ tag }}
                                </span>
                            </div>
                        </div>

                        <div
                            class="bg-gradient-to-br from-blue-50 to-purple-50 p-8 lg:p-12 flex flex-col justify-center"
                        >
                            <div>
                                <img
                                    :src="course.thumbnail"
                                    :alt="`Miniatura kursu ${course.title}`"
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
                                        v-if="video.isFree"
                                        class="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium"
                                    >
                                        Darmowy podgląd
                                    </span>
                                    <button
                                        class="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors"
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
