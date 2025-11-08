<script setup lang="ts">
interface AdminTableLoadingProps {
  message?: string
}

withDefaults(defineProps<AdminTableLoadingProps>(), {
  message: 'Ładowanie...'
})
</script>

<template>
  <div class="text-center py-12">
    <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"></div>
    <p class="mt-4 text-gray-600">{{ message }}</p>
  </div>
</template>

