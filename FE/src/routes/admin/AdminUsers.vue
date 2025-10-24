<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import MaxWidthWrapper from '@/components/wrappers/MaxWidthWrapper.vue'
import Modal from '@/components/ui/Modal.vue'
import AdminNav from '@/components/admin/AdminNav.vue'
import type { User } from '@/types/User'
import type { CourseListItem } from '@/types/Course'
import { getCourses } from '@/services/courseService'
import { getAllUsers, enrollUserToCourse, unenrollUserFromCourse, getUserCourses } from '@/services/adminService'

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
        <div class="mb-4">
          <h1 class="text-4xl font-bold text-gray-900 mb-2">
            Zarządzanie użytkownikami
          </h1>
          <p class="text-lg text-gray-600">
            Przypisuj użytkowników do kursów i zarządzaj rolami
          </p>
        </div>

        <input
          v-model="searchQuery"
          type="text"
          placeholder="Szukaj użytkownika..."
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div class="bg-white rounded-xl shadow-md overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Użytkownik</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Email</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Rola</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Przypisane kursy</th>
                <th class="px-6 py-4 text-right text-sm font-semibold text-gray-900">Akcje</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr
                v-for="user in filteredUsers"
                :key="user.id"
                class="hover:bg-gray-50 transition-colors"
              >
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span class="text-blue-600 font-semibold">
                        {{ user.username.charAt(0).toUpperCase() }}
                      </span>
                    </div>
                    <div>
                      <p class="font-semibold text-gray-900">{{ user.username }}</p>
                      <p class="text-sm text-gray-500">ID: {{ user.id }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 text-sm text-gray-700">
                  {{ user.email }}
                </td>
                <td class="px-6 py-4">
                  <button
                    @click="handleToggleRole(user)"
                    class="inline-flex items-center gap-2"
                  >
                    <span
                      class="px-3 py-1 rounded-full text-xs font-medium"
                      :class="user.role === 'ADMIN'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-gray-100 text-gray-700'"
                    >
                      {{ user.role === 'ADMIN' ? '👑 Admin' : '👤 Użytkownik' }}
                    </span>
                  </button>
                </td>
                <td class="px-6 py-4">
                  <div v-if="user.enrolledCourses.length > 0" class="flex flex-col gap-1">
                    <span
                      v-for="courseId in user.enrolledCourses.slice(0, 2)"
                      :key="courseId"
                      class="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded inline-block"
                    >
                      {{ getCourseTitle(courseId) }}
                    </span>
                    <span
                      v-if="user.enrolledCourses.length > 2"
                      class="text-xs text-gray-500"
                    >
                      +{{ user.enrolledCourses.length - 2 }} więcej
                    </span>
                  </div>
                  <span v-else class="text-sm text-gray-400">
                    Brak przypisanych kursów
                  </span>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center justify-end gap-2">
                    <button
                      @click="handleOpenModal(user)"
                      class="px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      Zarządzaj kursami
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div
          v-if="filteredUsers.length === 0"
          class="text-center py-12"
        >
          <p class="text-gray-500">Nie znaleziono użytkowników</p>
        </div>
      </div>
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
          <button
            @click="handleCloseModal"
            class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Anuluj
          </button>
          <button
            @click="handleSaveAssignments"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Zapisz zmiany
          </button>
        </div>
      </div>
    </Modal>
  </div>
</template>

