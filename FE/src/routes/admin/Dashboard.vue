<script setup lang="ts">
import { ref, onMounted } from 'vue'
import MaxWidthWrapper from '@/components/wrappers/MaxWidthWrapper.vue'
import AdminNav from '@/components/admin/AdminNav.vue'
import AdminTableHeader from '@/components/admin/table/AdminTableHeader.vue'
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
    <MaxWidthWrapper class="py-8 flex flex-col gap-6">
      <AdminTableHeader
        title="Panel Administracyjny"
        description="Zarządzaj kursami, tagami i użytkownikami"
      />

      <div v-if="error" class="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p class="text-sm text-red-700">{{ error }}</p>
      </div>

      <div v-if="isLoading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-purple-600"></div>
        <p class="mt-4 text-gray-600">Ładowanie statystyk...</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 group">
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <p class="text-sm font-medium text-gray-600 mb-1">Wszystkie kursy</p>
              <p class="text-3xl font-bold text-gray-900 group-hover:text-purple-700 transition-colors">{{ stats.totalCourses }}</p>
            </div>
            <div class="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-colors">
              <Icon
                name="books"
                class="w-6 h-6 text-blue-600"
              />
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 group">
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <p class="text-sm font-medium text-gray-600 mb-1">Aktywne kursy</p>
              <p class="text-3xl font-bold text-gray-900 group-hover:text-green-700 transition-colors">{{ stats.activeCourses }}</p>
            </div>
            <div class="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center group-hover:bg-green-100 transition-colors">
              <Icon
                name="check"
                class="w-6 h-6 text-green-600"
              />
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 group">
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <p class="text-sm font-medium text-gray-600 mb-1">Użytkownicy</p>
              <p class="text-3xl font-bold text-gray-900 group-hover:text-purple-700 transition-colors">{{ stats.totalUsers }}</p>
            </div>
            <div class="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center group-hover:bg-purple-100 transition-colors">
              <Icon
                name="users"
                class="w-6 h-6 text-purple-600"
              />
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 group">
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <p class="text-sm font-medium text-gray-600 mb-1">Tagi</p>
              <p class="text-3xl font-bold text-gray-900 group-hover:text-orange-700 transition-colors">{{ stats.totalTags }}</p>
            </div>
            <div class="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center group-hover:bg-orange-100 transition-colors">
              <Icon
                name="tags"
                class="w-6 h-6 text-orange-600"
              />
            </div>
          </div>
        </div>
      </div>

      <div v-if="!isLoading" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 class="text-xl font-bold text-gray-900 mb-6">Szybkie akcje</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <router-link
              to="/admin/courses"
              class="flex flex-col items-center p-6 bg-blue-50 rounded-lg hover:bg-blue-100 hover:shadow-md transition-all duration-200 group border border-blue-100"
              tabindex="0"
              aria-label="Zarządzaj kursami"
            >
              <div class="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-blue-200 transition-colors">
                <Icon
                  name="books"
                  class="w-7 h-7 text-blue-600"
                />
              </div>
              <span class="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">Zarządzaj kursami</span>
            </router-link>

            <router-link
              to="/admin/tags"
              class="flex flex-col items-center p-6 bg-green-50 rounded-lg hover:bg-green-100 hover:shadow-md transition-all duration-200 group border border-green-100"
              tabindex="0"
              aria-label="Zarządzaj tagami"
            >
              <div class="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-green-200 transition-colors">
                <Icon
                  name="tags"
                  class="w-7 h-7 text-green-600"
                />
              </div>
              <span class="font-semibold text-gray-900 group-hover:text-green-700 transition-colors">Zarządzaj tagami</span>
            </router-link>

            <router-link
              to="/admin/users"
              class="flex flex-col items-center p-6 bg-purple-50 rounded-lg hover:bg-purple-100 hover:shadow-md transition-all duration-200 group border border-purple-100"
              tabindex="0"
              aria-label="Zarządzaj użytkownikami"
            >
              <div class="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-purple-200 transition-colors">
                <Icon
                  name="users"
                  class="w-7 h-7 text-purple-600"
                />
              </div>
              <span class="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">Zarządzaj użytkownikami</span>
            </router-link>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 class="text-xl font-bold text-gray-900 mb-6">Ostatnie aktywności</h2>
          <div v-if="recentActivities.length === 0" class="text-center py-8">
            <Icon
              name="empty"
              class="w-12 h-12 text-gray-300 mx-auto mb-3"
            />
            <p class="text-sm text-gray-500">Brak ostatnich aktywności</p>
          </div>
          <div v-else class="space-y-4">
            <div
              v-for="(activity, index) in recentActivities.slice(0, 5)"
              :key="index"
              class="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div :class="['w-2 h-2 rounded-full mt-2 flex-shrink-0', getActivityColor(activity.type)]"></div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 leading-snug">{{ activity.description }}</p>
                <p class="text-xs text-gray-500 mt-1">{{ activity.timeAgo }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MaxWidthWrapper>
  </div>
</template>

