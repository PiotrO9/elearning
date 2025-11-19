<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import MaxWidthWrapper from '@/components/wrappers/MaxWidthWrapper.vue'
import AdminNav from '@/components/admin/AdminNav.vue'
import AdminTableHeader from '@/components/admin/table/AdminTableHeader.vue'
import AdminTableSearch from '@/components/admin/table/AdminTableSearch.vue'
import AdminTableLoading from '@/components/admin/table/AdminTableLoading.vue'
import AdminTable from '@/components/admin/table/AdminTable.vue'
import AdminTableRow from '@/components/admin/table/AdminTableRow.vue'
import TagList from '@/components/admin/TagList.vue'
import PublishStatusBadge from '@/components/admin/PublishStatusBadge.vue'
import Action from '@/components/ui/Action.vue'
import ConfirmModal from '@/components/ui/ConfirmModal.vue'
import Pagination from '@/components/ui/Pagination.vue'
import Icon from '@/components/ui/Icon.vue'
import type { CourseListItem } from '@/types/Course'
import { getCourses } from '@/services/courseService'
import { deleteCourse } from '@/services/adminService'

const tableColumns = [
  { label: 'Kurs', align: 'left' as const },
  { label: 'Instruktor', align: 'center' as const },
  { label: 'Tagi', align: 'center' as const },
  { label: 'Status', align: 'center' as const },
  { label: 'Data utworzenia', align: 'center' as const },
  { label: 'Akcje', align: 'center' as const }
]

const router = useRouter()

const courses = ref<CourseListItem[]>([])
const searchQuery = ref('')
const isLoading = ref(false)
const error = ref<string | null>(null)
const isDeleteModalOpen = ref(false)
const courseToDelete = ref<CourseListItem | null>(null)
const isDeleting = ref(false)

// Paginacja
const currentPage = ref(1)
const limit = ref(10)
const totalCourses = ref(0)

// Usuwamy filtrowanie po stronie klienta - paginacja działa na danych z API

async function fetchCourses() {
  isLoading.value = true
  error.value = null

  try {
    const response = await getCourses({
      page: currentPage.value,
      limit: limit.value
    })
    courses.value = response.courses
    totalCourses.value = response.total
  } catch (err: unknown) {
    const errorMessage = err && typeof err === 'object' && 'message' in err
      ? String((err as { message: unknown }).message)
      : 'Nie udało się pobrać kursów'
    error.value = errorMessage
    console.error('Error fetching courses:', err)
  } finally {
    isLoading.value = false
  }
}

function handlePageChange(page: number) {
  currentPage.value = page
  fetchCourses()
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
  } catch (err: unknown) {
    const errorMessage = err && typeof err === 'object' && 'message' in err
      ? String((err as { message: unknown }).message)
      : 'Nie udało się usunąć kursu'
    error.value = errorMessage
    console.error('Error deleting course:', err)
  } finally {
    isDeleting.value = false
  }
}

function cancelDeleteCourse() {
  isDeleteModalOpen.value = false
  courseToDelete.value = null
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
        :is-empty="courses.length === 0"
        empty-message="Nie znaleziono kursów"
      >
        <template #rows>
          <AdminTableRow
            v-for="course in courses"
            :key="course.id"
            :item="course"
          >
            <template #default="{ item }">
              <td class="px-6 py-4">
                <div class="flex items-center gap-4">
                  <div class="relative flex-shrink-0">
                    <img
                      :src="item.thumbnail"
                      :alt="item.title"
                      class="w-14 h-14 object-cover rounded-lg shadow-sm ring-1 ring-gray-200 group-hover:ring-purple-300 transition-all"
                    />
                    <div
                      v-if="item.isPublished"
                      class="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"
                      title="Opublikowany"
                    />
                  </div>
                  <div class="min-w-0 flex-1">
                    <p class="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors truncate">
                      {{ item.title }}
                    </p>
                    <p class="text-sm text-gray-500 line-clamp-1 mt-0.5">{{ item.description }}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-2 text-sm text-gray-700">
                  <Icon
                    name="user"
                    class="w-4 h-4 text-gray-400 flex-shrink-0"
                  />
                  <span class="truncate">{{ item.instructor || 'Brak instruktora' }}</span>
                </div>
              </td>
              <td class="px-6 py-4">
                <TagList
                  :tags="item.tags"
                  :max-visible="2"
                />
              </td>
              <td class="px-6 py-4">
                <PublishStatusBadge
                  :is-published="item.isPublished ?? false"
                />
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-2 text-sm text-gray-600">
                  <Icon
                    name="calendar"
                    class="w-4 h-4 text-gray-400"
                  />
                  <span>{{ item.createdAt }}</span>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center justify-end gap-1.5">
                  <Action
                    @click="handleEditCourse(item)"
                    variant="primary"
                    size="sm"
                    circle
                    aria-label="Edytuj kurs"
                  >
                    <Icon
                      name="edit"
                      class="w-4 h-4"
                    />
                  </Action>
                  <Action
                    @click="handleDeleteCourse(item)"
                    variant="danger"
                    size="sm"
                    circle
                    aria-label="Usuń kurs"
                  >
                    <Icon
                      name="delete"
                      class="w-4 h-4"
                    />
                  </Action>
                </div>
              </td>
            </template>
          </AdminTableRow>
        </template>
      </AdminTable>

      <Pagination
        v-if="!isLoading && totalCourses > 0"
        :current-page="currentPage"
        :total-items="totalCourses"
        :items-per-page="limit"
        @page-change="handlePageChange"
      />
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

