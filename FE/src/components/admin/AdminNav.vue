<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()

function isActive(path: string): boolean {
  return route.path === path || route.path.startsWith(path + '/')
}
</script>

<template>
  <nav class="bg-white shadow-md mb-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex space-x-8 py-4">
        <router-link
          to="/admin"
          :class="[
            'px-3 py-2 rounded-lg font-medium transition-colors',
            isActive('/admin') && route.path === '/admin'
              ? 'bg-purple-100 text-purple-700'
              : 'text-gray-700 hover:bg-gray-100'
          ]"
        >
          📊 Dashboard
        </router-link>

        <router-link
          to="/admin/courses"
          :class="[
            'px-3 py-2 rounded-lg font-medium transition-colors',
            isActive('/admin/courses')
              ? 'bg-purple-100 text-purple-700'
              : 'text-gray-700 hover:bg-gray-100'
          ]"
        >
          📚 Kursy
        </router-link>

        <router-link
          to="/admin/tags"
          :class="[
            'px-3 py-2 rounded-lg font-medium transition-colors',
            isActive('/admin/tags')
              ? 'bg-purple-100 text-purple-700'
              : 'text-gray-700 hover:bg-gray-100'
          ]"
        >
          🏷️ Tagi
        </router-link>

        <router-link
          to="/admin/users"
          :class="[
            'px-3 py-2 rounded-lg font-medium transition-colors',
            isActive('/admin/users')
              ? 'bg-purple-100 text-purple-700'
              : 'text-gray-700 hover:bg-gray-100'
          ]"
        >
          👥 Użytkownicy
        </router-link>

        <router-link
          to="/"
          class="ml-auto px-3 py-2 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-colors"
        >
          ← Wróć do strony głównej
        </router-link>
      </div>
    </div>
  </nav>
</template>

