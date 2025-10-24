<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCourses } from '../composables/useCourses'
import MaxWidthWrapper from '../components/wrappers/MaxWidthWrapper.vue'
import CourseCard from '../components/course/CourseCard.vue'

const router = useRouter()
const { courses, isLoading, error, fetchCourses } = useCourses()

const searchQuery = ref<string>('')

const filteredCourses = computed(() => {
  if (!courses.value) return []

  return courses.value.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    return matchesSearch
  })
})

function handleCourseClick(courseId: number) {
  router.push(`/courses/${courseId}`)
}

async function handleRetry() {
  await fetchCourses()
}

onMounted(async () => {
  await fetchCourses()
})
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

      <div v-if="isLoading" class="text-center py-20">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"></div>
        <p class="mt-4 text-gray-600">Ładowanie kursów...</p>
      </div>

      <div v-else-if="error" class="text-center py-20">
        <div class="text-6xl mb-4">⚠️</div>
        <h3 class="text-2xl font-bold text-gray-900 mb-2">
          Wystąpił błąd
        </h3>
        <p class="text-gray-600 mb-4">{{ error }}</p>
        <button
          @click="handleRetry"
          class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Spróbuj ponownie
        </button>
      </div>

      <template v-else>
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

        <div v-if="filteredCourses.length === 0" class="text-center py-20">
          <div class="text-6xl mb-4">🔍</div>
          <h3 class="text-2xl font-bold text-gray-900 mb-2">
            Nie znaleziono kursów
          </h3>
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
