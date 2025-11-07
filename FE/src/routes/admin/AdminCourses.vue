<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import MaxWidthWrapper from '@/components/wrappers/MaxWidthWrapper.vue'
import AdminNav from '@/components/admin/AdminNav.vue'
import AdminTableHeader from '@/components/admin/AdminTableHeader.vue'
import AdminTableSearch from '@/components/admin/AdminTableSearch.vue'
import AdminTableLoading from '@/components/admin/AdminTableLoading.vue'
import AdminTable from '@/components/admin/AdminTable.vue'
import AdminTableRow from '@/components/admin/AdminTableRow.vue'
import TagList from '@/components/admin/TagList.vue'
import PublishStatusBadge from '@/components/admin/PublishStatusBadge.vue'
import Action from '@/components/ui/Action.vue'
import ConfirmModal from '@/components/ui/ConfirmModal.vue'
import type { CourseListItem } from '@/types/Course'
import { getCourses } from '@/services/courseService'
import { deleteCourse, updateCourse } from '@/services/adminService'

const tableColumns = [
  { label: 'Kurs', align: 'left' as const },
  { label: 'Instruktor', align: 'left' as const },
  { label: 'Tagi', align: 'left' as const },
  { label: 'Status', align: 'left' as const },
  { label: 'Data utworzenia', align: 'left' as const },
  { label: 'Akcje', align: 'right' as const }
]

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
        <AdminTableHeader
          title="Zarządzanie kursami"
          description="Dodawaj, edytuj i usuwaj kursy"
          add-button-text="Dodaj kurs"
          add-button-aria-label="Dodaj nowy kurs"
          @add="handleEditCourse()"
        />

        <div v-if="error" class="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {{ error }}
        </div>

        <AdminTableSearch
          v-model="searchQuery"
          placeholder="Szukaj kursu..."
          :disabled="isLoading"
        />
      </div>

      <AdminTableLoading v-if="isLoading" message="Ładowanie kursów..." />

      <AdminTable
        v-else
        :columns="tableColumns"
        :is-empty="filteredCourses.length === 0"
        empty-message="Nie znaleziono kursów"
      >
        <template #rows>
          <AdminTableRow
            v-for="course in filteredCourses"
            :key="course.id"
            :item="course"
          >
            <template #default="{ item: course }">
              <td class="px-6 py-4">
                <div class="flex items-center gap-4">
                  <div class="relative flex-shrink-0">
                    <img
                      :src="course.thumbnail"
                      :alt="course.title"
                      class="w-14 h-14 object-cover rounded-lg shadow-sm ring-1 ring-gray-200 group-hover:ring-purple-300 transition-all"
                    />
                    <div
                      v-if="course.isPublished"
                      class="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"
                      title="Opublikowany"
                    />
                  </div>
                  <div class="min-w-0 flex-1">
                    <p class="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors truncate">
                      {{ course.title }}
                    </p>
                    <p class="text-sm text-gray-500 line-clamp-1 mt-0.5">{{ course.description }}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-2 text-sm text-gray-700">
                  <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span class="truncate">{{ course.instructor || 'Brak instruktora' }}</span>
                </div>
              </td>
              <td class="px-6 py-4">
                <TagList
                  :tags="course.tags"
                  :max-visible="2"
                />
              </td>
              <td class="px-6 py-4">
                <PublishStatusBadge
                  :is-published="course.isPublished"
                  :clickable="true"
                  @toggle="handleTogglePublish(course)"
                />
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-2 text-sm text-gray-600">
                  <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{{ course.createdAt }}</span>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center justify-end gap-1.5">
                  <Action
                    @click="handleEditCourse(course)"
                    variant="primary"
                    size="sm"
                    aria-label="Edytuj kurs"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span class="hidden sm:inline">Edytuj</span>
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
                    <span class="hidden sm:inline">Usuń</span>
                  </Action>
                </div>
              </td>
            </template>
          </AdminTableRow>
        </template>
      </AdminTable>
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

