<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCourses } from '../composables/useCourses'
import MaxWidthWrapper from '../components/wrappers/MaxWidthWrapper.vue'
import CourseCard from '../components/course/CourseCard.vue'

const router = useRouter()
const { getAllCourses } = useCourses()

const searchQuery = ref<string>('')

const mockCourses = getAllCourses()

const filteredCourses = computed(() => {
  return mockCourses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    return matchesSearch
  })
})

function handleCourseClick(courseId: number) {
  router.push(`/courses/${courseId}`)
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-12">
    <MaxWidthWrapper>
      <div class="mb-12">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">
          Odkryj nasze kursy
        </h1>
        <p class="text-lg text-gray-600">
          Rozwijaj swoje umiejętności z najlepszymi instruktorami
        </p>
      </div>

      <div class="mb-8">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Szukaj kursu..."
          class="w-full px-6 py-4 text-lg text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          aria-label="Wyszukaj kurs"
        />
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

      <div
        v-if="filteredCourses.length === 0"
        class="text-center py-20"
      >
        <div class="text-6xl mb-4">🔍</div>
        <h3 class="text-2xl font-bold text-gray-900 mb-2">
          Nie znaleziono kursów
        </h3>
        <p class="text-gray-600">
          Spróbuj zmienić kryteria wyszukiwania lub wybierz inną kategorię
        </p>
      </div>
    </MaxWidthWrapper>
  </div>
</template>
