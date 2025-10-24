<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import MaxWidthWrapper from '@/components/wrappers/MaxWidthWrapper.vue'
import AdminNav from '@/components/admin/AdminNav.vue'
import { getCourses } from '@/services/courseService'
import { getTags } from '@/services/adminService'

const stats = ref({
  totalCourses: 0,
  totalUsers: 0, // Wymaga endpoint GET /api/users
  totalTags: 0,
  activeCourses: 0
})

const isLoading = ref(false)

async function fetchStats() {
  isLoading.value = true

  try {
    const [coursesResponse, tagsResponse] = await Promise.all([
      getCourses(),
      getTags()
    ])

    stats.value.totalCourses = coursesResponse.total || coursesResponse.courses.length
    stats.value.activeCourses = coursesResponse.courses.filter(c => c.isPublished).length
    stats.value.totalTags = tagsResponse.length

    // totalUsers wymaga endpoint GET /api/users
    stats.value.totalUsers = 0
  } catch (err) {
    console.error('Error fetching stats:', err)
  } finally {
    isLoading.value = false
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

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600 mb-1">Wszystkie kursy</p>
              <p class="text-3xl font-bold text-gray-900">{{ stats.totalCourses }}</p>
            </div>
            <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span class="text-2xl">📚</span>
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
              <span class="text-2xl">✅</span>
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
              <span class="text-2xl">👥</span>
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
              <span class="text-2xl">🏷️</span>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
          <h2 class="text-xl font-bold text-gray-900 mb-4">Szybkie akcje</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <router-link
              to="/admin/courses"
              class="flex flex-col items-center p-6 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <span class="text-4xl mb-2">📚</span>
              <span class="font-semibold text-gray-900">Zarządzaj kursami</span>
            </router-link>

            <router-link
              to="/admin/tags"
              class="flex flex-col items-center p-6 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <span class="text-4xl mb-2">🏷️</span>
              <span class="font-semibold text-gray-900">Zarządzaj tagami</span>
            </router-link>

            <router-link
              to="/admin/users"
              class="flex flex-col items-center p-6 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <span class="text-4xl mb-2">👥</span>
              <span class="font-semibold text-gray-900">Zarządzaj użytkownikami</span>
            </router-link>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-md p-6">
          <h2 class="text-xl font-bold text-gray-900 mb-4">Ostatnie aktywności</h2>
          <div class="space-y-4">
            <div class="flex items-start">
              <div class="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
              <div class="flex-1">
                <p class="text-sm font-medium text-gray-900">Dodano nowy kurs</p>
                <p class="text-xs text-gray-500">5 minut temu</p>
              </div>
            </div>
            <div class="flex items-start">
              <div class="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></div>
              <div class="flex-1">
                <p class="text-sm font-medium text-gray-900">Zaktualizowano tag</p>
                <p class="text-xs text-gray-500">1 godzinę temu</p>
              </div>
            </div>
            <div class="flex items-start">
              <div class="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3"></div>
              <div class="flex-1">
                <p class="text-sm font-medium text-gray-900">Nowy użytkownik</p>
                <p class="text-xs text-gray-500">2 godziny temu</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MaxWidthWrapper>
  </div>
</template>

