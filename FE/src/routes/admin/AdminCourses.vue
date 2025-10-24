<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import MaxWidthWrapper from '@/components/wrappers/MaxWidthWrapper.vue'
import Modal from '@/components/ui/Modal.vue'
import AdminNav from '@/components/admin/AdminNav.vue'
import CourseForm from '@/components/admin/CourseForm.vue'
import type { CourseListItem } from '@/types/Course'
import type { Tag, CreateCourseInput, UpdateCourseInput } from '@/types/Admin'
import { getCourses } from '@/services/courseService'
import { updateCourse, deleteCourse, createCourse, getTags, assignTagsToCourse } from '@/services/adminService'

const router = useRouter()

const courses = ref<CourseListItem[]>([])
const tags = ref<Tag[]>([])
const isModalOpen = ref(false)
const searchQuery = ref('')
const selectedCourse = ref<CourseListItem | null>(null)
const isLoading = ref(false)
const isSaving = ref(false)
const error = ref<string | null>(null)

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

async function fetchTags() {
  try {
    tags.value = await getTags()
  } catch (err: any) {
    console.error('Error fetching tags:', err)
  }
}

function handleOpenModal(course?: CourseListItem) {
  selectedCourse.value = course || null
  isModalOpen.value = true
}

function handleCloseModal() {
  isModalOpen.value = false
  selectedCourse.value = null
}

async function handleSaveCourse(data: CreateCourseInput | UpdateCourseInput, tagIds: string[]) {
  isSaving.value = true

  try {
    let courseId: string

    if (selectedCourse.value) {
      // Edycja
      courseId = selectedCourse.value.id.toString()
      await updateCourse(courseId, data as UpdateCourseInput)
    } else {
      // Tworzenie
      const response = await createCourse(data as CreateCourseInput)
      courseId = response.data?.id || ''
    }

    // Przypisz tagi do kursu (jeśli są wybrane)
    if (courseId && tagIds.length > 0) {
      try {
        await assignTagsToCourse(courseId, tagIds)
      } catch (err) {
        console.error('Error assigning tags:', err)
        // Nie przerywamy procesu jeśli przypisanie tagów się nie powiodło
      }
    }

    await fetchCourses()
    handleCloseModal()
  } catch (err: any) {
    alert('Błąd podczas zapisywania kursu: ' + (err.response?.data?.message || err.message || 'Nieznany błąd'))
    console.error('Error saving course:', err)
  } finally {
    isSaving.value = false
  }
}

async function handleDeleteCourse(courseId: string | number) {
  if (!confirm('Czy na pewno chcesz usunąć ten kurs?')) return

  try {
    await deleteCourse(courseId.toString())
    await fetchCourses()
  } catch (err: any) {
    alert('Błąd podczas usuwania kursu: ' + (err.message || 'Nieznany błąd'))
    console.error('Error deleting course:', err)
  }
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
  fetchTags()
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
          <button
            @click="handleOpenModal()"
            class="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <span class="text-xl">+</span>
            Dodaj kurs
          </button>
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
                  <button
                    @click="handleTogglePublish(course)"
                    class="flex items-center gap-2"
                  >
                    <span
                      class="px-3 py-1 rounded-full text-xs font-medium"
                      :class="course.isPublished
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'"
                    >
                      {{ course.isPublished ? 'Opublikowany' : 'Wersja robocza' }}
                    </span>
                  </button>
                </td>
                <td class="px-6 py-4 text-sm text-gray-700">
                  {{ course.createdAt }}
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center justify-end gap-2">
                    <button
                      @click="handleOpenModal(course)"
                      class="px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      Edytuj
                    </button>
                    <button
                      @click="handleDeleteCourse(course.id)"
                      class="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      Usuń
                    </button>
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

    <Modal :is-open="isModalOpen" @update:is-open="handleCloseModal">
      <div class="p-6 max-h-[90vh] overflow-y-auto">
        <CourseForm
          :course="selectedCourse"
          :all-tags="tags"
          :is-loading="isSaving"
          @save="handleSaveCourse"
          @cancel="handleCloseModal"
        />
      </div>
    </Modal>
  </div>
</template>

