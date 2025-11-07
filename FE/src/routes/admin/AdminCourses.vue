<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import MaxWidthWrapper from '@/components/wrappers/MaxWidthWrapper.vue'
import AdminNav from '@/components/admin/AdminNav.vue'
import ConfirmModal from '@/components/ui/ConfirmModal.vue'
import Action from '@/components/ui/Action.vue'
import type { CourseListItem } from '@/types/Course'
import { getCourses } from '@/services/courseService'
import { deleteCourse, updateCourse } from '@/services/adminService'

const router = useRouter()

const courses = ref<CourseListItem[]>([])
const searchQuery = ref('')
const isLoading = ref(false)
const error = ref<string | null>(null)
const isDeleteModalOpen = ref(false)
const courseToDelete = ref<CourseListItem | null>(null)
const isDeleting = ref(false)

const filteredCourses = computed(() => {
  if (!courses.value) return []
  if (!searchQuery.value) return courses.value

  return courses.value.filter(course =>
    course.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    (course.description && course.description.toLowerCase().includes(searchQuery.value.toLowerCase()))
  )
})

async function fetchCourses() {
  isLoading.value = true
  error.value = null

  try {
    const response = await getCourses()
    courses.value = response.courses
  } catch (err: any) {
    error.value = err.message || 'Nie udało się pobrać kursów'
    console.error('Error fetching courses:', err)
  } finally {
    isLoading.value = false
  }
}

function handleEditCourse(course?: CourseListItem) {
  if (course) {
    router.push(`/admin/courses/${course.id}`)
  } else {
    router.push('/admin/courses/new')
  }
}

function handleDeleteCourse(course: CourseListItem) {
  courseToDelete.value = course
  isDeleteModalOpen.value = true
}

async function confirmDeleteCourse() {
  if (!courseToDelete.value) return

  isDeleting.value = true
  error.value = null

  try {
    await deleteCourse(courseToDelete.value.id.toString())
    await fetchCourses()
    isDeleteModalOpen.value = false
    courseToDelete.value = null
  } catch (err: any) {
    error.value = err.message || 'Nie udało się usunąć kursu'
    console.error('Error deleting course:', err)
  } finally {
    isDeleting.value = false
  }
}

function cancelDeleteCourse() {
  isDeleteModalOpen.value = false
  courseToDelete.value = null
}

async function handleTogglePublish(course: CourseListItem) {
  try {
    await updateCourse(course.id.toString(), {
      isPublished: !course.isPublished
    })
    await fetchCourses()
  } catch (err: any) {
    alert('Błąd podczas zmiany statusu: ' + (err.message || 'Nieznany błąd'))
    console.error('Error toggling publish:', err)
  }
}

onMounted(() => {
  fetchCourses()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <AdminNav />
    <MaxWidthWrapper class="py-8">
      <div class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h1 class="text-4xl font-bold text-gray-900 mb-2">
              Zarządzanie kursami
            </h1>
            <p class="text-lg text-gray-600">
              Dodawaj, edytuj i usuwaj kursy
            </p>
          </div>
          <Action
            @click="handleEditCourse()"
            variant="primary"
            size="lg"
            aria-label="Dodaj nowy kurs"
          >
            <span class="text-xl">+</span>
            Dodaj kurs
          </Action>
        </div>

        <div v-if="error" class="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {{ error }}
        </div>

        <div class="flex gap-4">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Szukaj kursu..."
            class="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            :disabled="isLoading"
          />
        </div>
      </div>

      <div v-if="isLoading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"></div>
        <p class="mt-4 text-gray-600">Ładowanie kursów...</p>
      </div>

      <div v-else class="bg-white rounded-xl shadow-md overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Kurs</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Instruktor</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Tagi</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Data utworzenia</th>
                <th class="px-6 py-4 text-right text-sm font-semibold text-gray-900">Akcje</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr
                v-for="course in filteredCourses"
                :key="course.id"
                class="hover:bg-gray-50 transition-colors"
              >
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <img
                      :src="course.thumbnail"
                      :alt="course.title"
                      class="w-16 h-16 object-cover rounded-lg"
                    />
                    <div>
                      <p class="font-semibold text-gray-900">{{ course.title }}</p>
                      <p class="text-sm text-gray-500 line-clamp-1">{{ course.description }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 text-sm text-gray-700">
                  {{ course.instructor }}
                </td>
                <td class="px-6 py-4">
                  <div class="flex flex-wrap gap-1">
                    <span
                      v-for="tag in (Array.isArray(course.tags) ? course.tags.slice(0, 2) : [])"
                      :key="typeof tag === 'string' ? tag : tag.id"
                      class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full"
                    >
                      {{ typeof tag === 'string' ? tag : tag.name }}
                    </span>
                    <span
                      v-if="course.tags && course.tags.length > 2"
                      class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                    >
                      +{{ course.tags.length - 2 }}
                    </span>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <Action
                    @click="handleTogglePublish(course)"
                    variant="ghost"
                    size="sm"
                    aria-label="Zmień status publikacji"
                  >
                    <span
                      class="px-3 py-1 rounded-full text-xs font-medium"
                      :class="course.isPublished
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'"
                    >
                      {{ course.isPublished ? 'Opublikowany' : 'Wersja robocza' }}
                    </span>
                  </Action>
                </td>
                <td class="px-6 py-4 text-sm text-gray-700">
                  {{ course.createdAt }}
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center justify-end gap-2">
                    <Action
                      @click="handleEditCourse(course)"
                      variant="primary"
                      size="sm"
                      aria-label="Edytuj kurs"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edytuj
                    </Action>
                    <Action
                      @click="handleDeleteCourse(course)"
                      variant="danger"
                      size="sm"
                      aria-label="Usuń kurs"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Usuń
                    </Action>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div
          v-if="filteredCourses.length === 0"
          class="text-center py-12"
        >
          <p class="text-gray-500">Nie znaleziono kursów</p>
        </div>
      </div>
    </MaxWidthWrapper>

    <ConfirmModal
      :is-open="isDeleteModalOpen"
      title="Usuń kurs"
      :message="courseToDelete ? `Czy na pewno chcesz usunąć kurs '${courseToDelete.title}'? Ta operacja jest nieodwracalna.` : ''"
      confirm-text="Usuń"
      cancel-text="Anuluj"
      variant="danger"
      :is-loading="isDeleting"
      @confirm="confirmDeleteCourse"
      @cancel="cancelDeleteCourse"
      @update:is-open="cancelDeleteCourse"
    />
  </div>
</template>

