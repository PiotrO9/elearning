<script setup lang="ts">
import CourseCard from '@/components/course/CourseCard.vue'
import { useCourses } from '@/composables/useCourses'
import { useHead } from '@vueuse/head'
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const { courses, fetchCourses, error, isLoading } = useCourses()

const mainCourses = fetchCourses()

console.log(mainCourses)

const navigateToCourses = () => {
    router.push('/courses')
}

function handleCourseClick(courseId: string) {
    router.push(`/courses/${courseId}`)
}

onMounted(async () => {
    await fetchCourses()
})

useHead({
    title: 'Strona Główna - E-Learning Platforma',
})
</script>

<template>
    <div class="min-h-screen">
        <section
            class="relative bg-gradient-to-br from-primary to-footer-bg text-white py-20 px-6 overflow-hidden"
        >
            <div
                class="absolute top-0 right-0 w-96 h-96 bg-accent rounded-full opacity-10 blur-3xl"
            ></div>
            <div
                class="absolute bottom-0 left-0 w-72 h-72 bg-secondary rounded-full opacity-10 blur-3xl"
            ></div>

            <div class="max-w-7xl mx-auto relative z-10">
                <div class="grid md:grid-cols-2 gap-12 items-center">
                    <div class="space-y-6">
                        <div
                            class="inline-block bg-secondary text-button-secondary-text px-4 py-2 rounded-full text-sm font-semibold"
                        >
                            🎓 Zacznij Się Uczyć Dziś
                        </div>
                        <h1 class="text-5xl md:text-6xl font-bold leading-tight">
                            Odkryj Swój <span class="text-secondary"> Potencjał</span>
                        </h1>
                        <p class="text-xl text-text-on-dark-muted leading-relaxed">
                            Uzyskaj dostęp do tysięcy kursów prowadzonych przez ekspertów
                            branżowych. Ucz się we własnym tempie i osiągaj swoje cele.
                        </p>
                        <div class="flex flex-wrap gap-4 pt-4">
                            <button
                                @click="navigateToCourses"
                                class="bg-secondary hover:bg-button-secondary-text text-button-secondary-text hover:text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                            >
                                Przeglądaj Kursy
                            </button>
                            <button
                                class="border-2 border-white hover:bg-white hover:text-primary px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300"
                            >
                                Dowiedz Się Więcej
                            </button>
                        </div>
                        <div class="flex items-center gap-8 pt-6">
                            <div>
                                <div class="text-3xl font-bold">50K+</div>
                                <div class="text-text-on-dark-muted text-sm">
                                    Aktywnych Studentów
                                </div>
                            </div>
                            <div class="w-px h-12 bg-white opacity-30"></div>
                            <div>
                                <div class="text-3xl font-bold">1000+</div>
                                <div class="text-text-on-dark-muted text-sm">Kursów</div>
                            </div>
                            <div class="w-px h-12 bg-white opacity-30"></div>
                            <div>
                                <div class="text-3xl font-bold">4.8★</div>
                                <div class="text-text-on-dark-muted text-sm">Średnia Ocena</div>
                            </div>
                        </div>
                    </div>
                    <div class="hidden md:block">
                        <div class="relative">
                            <div
                                class="w-full h-96 bg-accent bg-opacity-20 rounded-3xl backdrop-blur-sm border border-white border-opacity-20 flex items-center justify-center"
                            >
                                <div class="text-center space-y-4">
                                    <div class="text-8xl">📚</div>
                                    <div class="text-2xl font-semibold">
                                        Twoja Podróż Edukacyjna
                                    </div>
                                    <div class="text-text-on-dark-muted">Zaczyna Się Tutaj</div>
                                </div>
                            </div>
                            <div
                                class="absolute -top-6 -right-6 bg-white text-primary px-6 py-4 rounded-2xl shadow-xl transform rotate-3"
                            >
                                <div class="font-bold text-lg">Nowy Kurs!</div>
                                <div class="text-sm">Dodany Dzisiaj</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <section class="py-20 px-6 bg-background">
            <div class="max-w-7xl mx-auto">
                <div class="text-center mb-16 space-y-4">
                    <div
                        class="inline-block bg-accent text-primary px-4 py-2 rounded-full text-sm font-semibold"
                    >
                        Polecane Kursy
                    </div>
                    <h2 class="text-4xl md:text-5xl font-bold text-text">
                        Najpopularniejsze <span class="text-primary">Teraz</span>
                    </h2>
                    <p class="text-lg text-text-muted max-w-2xl mx-auto">
                        Odkryj nasze najpopularniejsze kursy wybrane przez tysiące studentów z
                        całego świata
                    </p>
                </div>
                <div
                    class="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
                    v-if="courses && !isLoading && !error"
                >
                    <CourseCard
                        v-for="course in courses.slice(0, 3)"
                        :course="course"
                        :key="course.id"
                        @click="handleCourseClick"
                    />
                </div>
                <div class="text-center mt-12">
                    <button
                        @click="navigateToCourses"
                        class="bg-secondary hover:bg-button-secondary-text text-button-secondary-text hover:text-white px-10 py-4 rounded-lg font-semibold text-lg transition-all duration-300 shadow-md hover:shadow-xl"
                    >
                        Zobacz Wszystkie Kursy →
                    </button>
                </div>
            </div>
        </section>
    </div>
</template>

<style scoped>
.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
</style>
