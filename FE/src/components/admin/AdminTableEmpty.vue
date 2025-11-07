<script setup lang="ts">
interface AdminTableEmptyProps {
  message?: string
}

withDefaults(defineProps<AdminTableEmptyProps>(), {
  message: 'Nie znaleziono danych'
})
</script>

<template>
  <div class="text-center py-16 px-6">
    <div class="flex flex-col items-center gap-4">
      <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
        <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      </div>
      <p class="text-gray-500 font-medium">{{ message }}</p>
    </div>
  </div>
</template>

