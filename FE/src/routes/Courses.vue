<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCourses } from '../composables/useCourses'
import MaxWidthWrapper from '../components/wrappers/MaxWidthWrapper.vue'
import CourseCard from '../components/course/CourseCard.vue'
import { Icon } from '@iconify/vue'

const router = useRouter()
const { getAllCourses } = useCourses()

const searchQuery = ref<string>('')

const mockCourses = getAllCourses()

const selectedTag = ref<number>()

const filteredCourses = computed(() => {
    return mockCourses.filter((course) => {
        const matchesSearch =
            course.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            course.description.toLowerCase().includes(searchQuery.value.toLowerCase())
        return matchesSearch
    })
})

function handleCourseClick(courseId: number) {
    router.push(`/courses/${courseId}`)
}

function selectTag(tagId: number) {
    selectedTag.value = tagId
}

const tags = [
    { name: 'Frontend', id: 0 },
    { name: 'Backend', id: 1 },
    { name: 'UI/UX', id: 2 },
    { name: 'JavaScript', id: 3 },
    { name: 'Python', id: 4 },
]
</script>

<template>
    <div class="min-h-screen bg-gray-50 py-12">
        <MaxWidthWrapper>
            <div class="mb-12">
                <h1 class="text-4xl font-bold text-gray-900 mb-4">Odkryj nasze kursy</h1>
                <p class="text-lg text-gray-600">
                    Rozwijaj swoje umiejętności z najlepszymi instruktorami
                </p>
            </div>

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
            <div class="mb-8 flex justify-start items-center gap-3 text-sm">
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
                    Znaleziono <span class="font-semibold">{{ filteredCourses.length }}</span>
                    {{ filteredCourses.length === 1 ? 'kurs' : 'kursów' }}
                </p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <CourseCard
                    v-for="course in filteredCourses"
                    :key="course.id"
                    :course="course"
                    @click="handleCourseClick"
                />
            </div>

            <div v-if="filteredCourses.length === 0" class="text-center py-20">
                <div class="text-6xl mb-4">🔍</div>
                <h3 class="text-2xl font-bold text-gray-900 mb-2">Nie znaleziono kursów</h3>
                <p class="text-gray-600">
                    Spróbuj zmienić kryteria wyszukiwania lub wybierz inną kategorię
                </p>
            </div>
        </MaxWidthWrapper>
    </div>
</template>
