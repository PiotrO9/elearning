<script setup lang="ts">
import { ref, onMounted } from 'vue'
import MaxWidthWrapper from '@/components/wrappers/MaxWidthWrapper.vue'
import AdminNav from '@/components/admin/AdminNav.vue'
import Icon from '@/components/ui/Icon.vue'
import { getDashboard } from '@/services/adminService'

const stats = ref({
  totalCourses: 0,
  totalUsers: 0,
  totalTags: 0,
  activeCourses: 0
})

const recentActivities = ref<Array<{
  description: string
  timeAgo: string
  timestamp: string
  type: 'course_added' | 'course_updated' | 'tag_added' | 'tag_updated' | 'user_registered'
}>>([])

const isLoading = ref(false)
const error = ref<string | null>(null)

async function fetchStats() {
  isLoading.value = true
  error.value = null

  try {
    const response = await getDashboard()

    if (response.success && response.data) {
      const metrics = response.data.metrics

      stats.value = {
        totalCourses: metrics.totalCourses,
        activeCourses: metrics.activeCourses,
        totalUsers: metrics.totalUsers,
        totalTags: metrics.totalTags
      }

      recentActivities.value = response.data.recentActivities || []
    } else {
      error.value = 'Nie udało się pobrać statystyk'
    }
  } catch (err: unknown) {
    const errorMessage = err && typeof err === 'object' && 'response' in err
      ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
      : err && typeof err === 'object' && 'message' in err
      ? String((err as { message: unknown }).message)
      : 'Wystąpił błąd podczas pobierania statystyk'
    error.value = errorMessage || 'Wystąpił błąd podczas pobierania statystyk'
    console.error('Error fetching stats:', err)
  } finally {
    isLoading.value = false
  }
}

function getActivityColor(type: string): string {
  switch (type) {
    case 'course_added':
      return 'bg-blue-500'
    case 'course_updated':
      return 'bg-blue-400'
    case 'tag_added':
      return 'bg-green-500'
    case 'tag_updated':
      return 'bg-green-400'
    case 'user_registered':
      return 'bg-purple-500'
    default:
      return 'bg-gray-500'
  }
}

onMounted(() => {
  fetchStats()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <AdminNav />
    <MaxWidthWrapper class="py-8">
      <div class="mb-8">
        <h1 class="text-4xl font-bold text-gray-900 mb-2">
          Panel Administracyjny
        </h1>
        <p class="text-lg text-gray-600">
          Zarządzaj kursami, tagami i użytkownikami
        </p>
      </div>

      <div v-if="error" class="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
        <p class="text-sm text-red-700">{{ error }}</p>
      </div>

      <div v-if="isLoading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"></div>
        <p class="mt-4 text-gray-600">Ładowanie statystyk...</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600 mb-1">Wszystkie kursy</p>
              <p class="text-3xl font-bold text-gray-900">{{ stats.totalCourses }}</p>
            </div>
            <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Icon
                name="books"
                style="--icon-size: 24px; --icon-color: #3b82f6"
              />
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600 mb-1">Aktywne kursy</p>
              <p class="text-3xl font-bold text-gray-900">{{ stats.activeCourses }}</p>
            </div>
            <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Icon
                name="check"
                style="--icon-size: 24px; --icon-color: #10b981"
              />
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600 mb-1">Użytkownicy</p>
              <p class="text-3xl font-bold text-gray-900">{{ stats.totalUsers }}</p>
            </div>
            <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Icon
                name="users"
                style="--icon-size: 24px; --icon-color: #8b5cf6"
              />
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600 mb-1">Tagi</p>
              <p class="text-3xl font-bold text-gray-900">{{ stats.totalTags }}</p>
            </div>
            <div class="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <Icon
                name="tags"
                style="--icon-size: 24px; --icon-color: #f97316"
              />
            </div>
          </div>
        </div>
      </div>

      <div v-if="!isLoading" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
          <h2 class="text-xl font-bold text-gray-900 mb-4">Szybkie akcje</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <router-link
              to="/admin/courses"
              class="flex flex-col items-center p-6 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Icon
                name="books"
                style="--icon-size: 48px; --icon-color: #3b82f6"
                class="mb-2"
              />
              <span class="font-semibold text-gray-900">Zarządzaj kursami</span>
            </router-link>

            <router-link
              to="/admin/tags"
              class="flex flex-col items-center p-6 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <Icon
                name="tags"
                style="--icon-size: 48px; --icon-color: #10b981"
                class="mb-2"
              />
              <span class="font-semibold text-gray-900">Zarządzaj tagami</span>
            </router-link>

            <router-link
              to="/admin/users"
              class="flex flex-col items-center p-6 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <Icon
                name="users"
                style="--icon-size: 48px; --icon-color: #8b5cf6"
                class="mb-2"
              />
              <span class="font-semibold text-gray-900">Zarządzaj użytkownikami</span>
            </router-link>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-md p-6">
          <h2 class="text-xl font-bold text-gray-900 mb-4">Ostatnie aktywności</h2>
          <div v-if="recentActivities.length === 0" class="text-center py-8 text-gray-500">
            <p class="text-sm">Brak ostatnich aktywności</p>
          </div>
          <div v-else class="space-y-4">
            <div
              v-for="(activity, index) in recentActivities.slice(0, 2)"
              :key="index"
              class="flex items-start"
            >
              <div :class="['w-2 h-2 rounded-full mt-2 mr-3', getActivityColor(activity.type)]"></div>
              <div class="flex-1">
                <p class="text-sm font-medium text-gray-900">{{ activity.description }}</p>
                <p class="text-xs text-gray-500">{{ activity.timeAgo }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MaxWidthWrapper>
  </div>
</template>

