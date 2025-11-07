<script setup lang="ts">
import Icon from '@/components/ui/Icon.vue'

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
        <Icon
          name="empty"
          class="w-8 h-8 text-gray-400"
        />
      </div>
      <p class="text-gray-500 font-medium">{{ message }}</p>
    </div>
  </div>
</template>

