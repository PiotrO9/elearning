<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import MaxWidthWrapper from '@/components/wrappers/MaxWidthWrapper.vue'
import Modal from '@/components/ui/Modal.vue'
import AdminNav from '@/components/admin/AdminNav.vue'
import AdminTableHeader from '@/components/admin/AdminTableHeader.vue'
import AdminTableSearch from '@/components/admin/AdminTableSearch.vue'
import AdminTable from '@/components/admin/AdminTable.vue'
import AdminTableRow from '@/components/admin/AdminTableRow.vue'
import Action from '@/components/ui/Action.vue'
import type { User } from '@/types/User'
import type { CourseListItem } from '@/types/Course'
import { getCourses } from '@/services/courseService'
import { getAllUsers, enrollUserToCourse, unenrollUserFromCourse, getUserCourses } from '@/services/adminService'

const tableColumns = [
  { label: 'Użytkownik', align: 'left' as const },
  { label: 'Email', align: 'left' as const },
  { label: 'Rola', align: 'left' as const },
  { label: 'Przypisane kursy', align: 'left' as const },
  { label: 'Akcje', align: 'right' as const }
]

interface UserWithCourses extends User {
  enrolledCourses: string[]
  enrolledAt?: string
}

const users = ref<User[]>([])
const courses = ref<CourseListItem[]>([])
const usersWithCourses = ref<Map<string, string[]>>(new Map())

const isModalOpen = ref(false)
const searchQuery = ref('')
const selectedUser = ref<User | null>(null)
const selectedCourseIds = ref<string[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)

// UWAGA: Endpoint GET /api/users nie istnieje jeszcze w backend
// Tymczasowo używamy mocków
const mockUsers = ref<UserWithCourses[]>([
  {
    id: '1',
    email: 'jan.kowalski@example.com',
    username: 'jankowalski',
    role: 'USER',
    enrolledCourses: [],
  },
  {
    id: '2',
    email: 'anna.nowak@example.com',
    username: 'annanowak',
    role: 'USER',
    enrolledCourses: [],
  },
  {
    id: '3',
    email: 'admin@example.com',
    username: 'admin',
    role: 'ADMIN',
    enrolledCourses: [],
  }
])

const filteredUsers = computed(() => {
  if (!mockUsers.value) return []
  if (!searchQuery.value) return mockUsers.value

  return mockUsers.value.filter(user =>
    user.username.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

async function fetchCourses() {
  try {
    const response = await getCourses()
    courses.value = response.courses
  } catch (err: any) {
    console.error('Error fetching courses:', err)
  }
}

async function fetchUserCourses(userId: string) {
  try {
    const response = await getUserCourses(userId)
    return response.data.items.map(c => c.id.toString())
  } catch (err: any) {
    console.error('Error fetching user courses:', err)
    return []
  }
}

function getCourseTitle(courseId: string): string {
  return courses.value.find(c => c.id.toString() === courseId)?.title || 'Nieznany kurs'
}

async function handleOpenModal(user: UserWithCourses) {
  selectedUser.value = user
  isLoading.value = true

  try {
    const enrolledCourseIds = await fetchUserCourses(user.id)
    selectedCourseIds.value = enrolledCourseIds
  } catch (err) {
    selectedCourseIds.value = user.enrolledCourses || []
  } finally {
    isLoading.value = false
  }

  isModalOpen.value = true
}

function handleCloseModal() {
  isModalOpen.value = false
  selectedUser.value = null
  selectedCourseIds.value = []
}

function handleToggleCourse(courseId: string) {
  const index = selectedCourseIds.value.indexOf(courseId)
  if (index > -1) {
    selectedCourseIds.value.splice(index, 1)
  } else {
    selectedCourseIds.value.push(courseId)
  }
}

async function handleSaveAssignments() {
  if (!selectedUser.value) return

  try {
    // TODO: Implement enrollment/unenrollment based on differences
    // For now, just close the modal
    alert('Funkcjonalność zapisu wymaga implementacji logiki porównywania zmian')
    handleCloseModal()
  } catch (err: any) {
    alert('Błąd podczas zapisywania: ' + (err.message || 'Nieznany błąd'))
    console.error('Error saving assignments:', err)
  }
}

function handleToggleRole(user: UserWithCourses) {
  const index = mockUsers.value.findIndex(u => u.id === user.id)
  if (index !== -1) {
    mockUsers.value[index].role = user.role === 'ADMIN' ? 'USER' : 'ADMIN'
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
          title="Zarządzanie użytkownikami"
          description="Przypisuj użytkowników do kursów i zarządzaj rolami"
        />

        <AdminTableSearch
          v-model="searchQuery"
          placeholder="Szukaj użytkownika..."
        />
      </div>

      <AdminTable
        :columns="tableColumns"
        :is-empty="filteredUsers.length === 0"
        empty-message="Nie znaleziono użytkowników"
      >
        <template #rows>
          <AdminTableRow
            v-for="user in filteredUsers"
            :key="user.id"
            :item="user"
          >
            <template #default="{ item: user }">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="relative flex-shrink-0">
                    <div class="w-11 h-11 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center shadow-sm ring-2 ring-white group-hover:ring-purple-200 transition-all">
                      <span class="text-white font-semibold text-sm">
                        {{ user.username.charAt(0).toUpperCase() }}
                      </span>
                    </div>
                    <div
                      v-if="user.role === 'ADMIN'"
                      class="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-yellow-400 rounded-full border-2 border-white flex items-center justify-center"
                      title="Administrator"
                    >
                      <svg class="w-2.5 h-2.5 text-yellow-900" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                  </div>
                  <div class="min-w-0 flex-1">
                    <p class="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors truncate">
                      {{ user.username }}
                    </p>
                    <p class="text-xs text-gray-500 mt-0.5">ID: {{ user.id }}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-2 text-sm text-gray-700">
                  <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span class="truncate">{{ user.email }}</span>
                </div>
              </td>
              <td class="px-6 py-4">
                <button
                  @click="handleToggleRole(user)"
                  class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                  tabindex="0"
                  aria-label="Zmień rolę użytkownika"
                  @keydown="(e) => e.key === 'Enter' && handleToggleRole(user)"
                >
                  <span
                    class="px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5"
                    :class="user.role === 'ADMIN'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-gray-100 text-gray-700'"
                  >
                    <svg
                      v-if="user.role === 'ADMIN'"
                      class="w-3.5 h-3.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <svg
                      v-else
                      class="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {{ user.role === 'ADMIN' ? 'Admin' : 'Użytkownik' }}
                  </span>
                </button>
              </td>
              <td class="px-6 py-4">
                <div v-if="user.enrolledCourses.length > 0" class="flex flex-col gap-1.5">
                  <div class="flex flex-wrap gap-1">
                    <span
                      v-for="courseId in user.enrolledCourses.slice(0, 2)"
                      :key="courseId"
                      class="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md font-medium border border-blue-100"
                    >
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      <span class="truncate max-w-[120px]">{{ getCourseTitle(courseId) }}</span>
                    </span>
                  </div>
                  <span
                    v-if="user.enrolledCourses.length > 2"
                    class="text-xs text-gray-500 font-medium"
                  >
                    +{{ user.enrolledCourses.length - 2 }} więcej
                  </span>
                </div>
                <span v-else class="inline-flex items-center gap-1.5 text-sm text-gray-400">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Brak przypisanych kursów
                </span>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center justify-end">
                  <Action
                    @click="handleOpenModal(user)"
                    variant="outline"
                    size="sm"
                    aria-label="Zarządzaj kursami użytkownika"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                    <span class="hidden sm:inline">Zarządzaj kursami</span>
                  </Action>
                </div>
              </td>
            </template>
          </AdminTableRow>
        </template>
      </AdminTable>
    </MaxWidthWrapper>

    <Modal :is-open="isModalOpen" @update:is-open="handleCloseModal">
      <div class="p-6">
        <h2 class="text-2xl font-bold text-gray-900 mb-2">
          Przypisz kursy
        </h2>
        <p class="text-gray-600 mb-6">
          Użytkownik: <span class="font-semibold">{{ selectedUser?.username }}</span>
        </p>

        <div class="mb-6 max-h-96 overflow-y-auto">
          <div v-if="isLoading" class="text-center py-8">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
          </div>
          <div v-else-if="courses.length === 0" class="text-center py-8 text-gray-500">
            Brak dostępnych kursów
          </div>
          <div v-else class="space-y-3">
            <label
              v-for="course in courses"
              :key="course.id"
              class="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                :checked="selectedCourseIds.includes(course.id.toString())"
                @change="handleToggleCourse(course.id.toString())"
                class="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <div class="flex-1">
                <p class="font-medium text-gray-900">{{ course.title }}</p>
              </div>
            </label>
          </div>
        </div>

        <div class="flex justify-end gap-3">
          <Action
            @click="handleCloseModal"
            variant="ghost"
            size="md"
            aria-label="Anuluj"
          >
            Anuluj
          </Action>
          <Action
            @click="handleSaveAssignments"
            variant="primary"
            size="md"
            aria-label="Zapisz zmiany"
          >
            Zapisz zmiany
          </Action>
        </div>
      </div>
    </Modal>
  </div>
</template>

