<script setup lang="ts">
import Action from '@/components/ui/Action.vue'

interface AdminTableHeaderProps {
  title: string
  description: string
  addButtonText?: string
  addButtonAriaLabel?: string
}

withDefaults(defineProps<AdminTableHeaderProps>(), {
  addButtonText: '',
  addButtonAriaLabel: ''
})

const emit = defineEmits<{
  add: []
}>()

function handleAdd() {
  emit('add')
}
</script>

<template>
  <div class="flex items-center justify-between mb-4">
    <div>
      <h1 class="text-4xl font-bold text-gray-900 mb-2">
        {{ title }}
      </h1>
      <p class="text-lg text-gray-600">
        {{ description }}
      </p>
    </div>
    <slot name="action">
      <Action
        v-if="addButtonText"
        @click="handleAdd"
        variant="primary"
        size="lg"
        :aria-label="addButtonAriaLabel || `Dodaj ${title.toLowerCase()}`"
      >
        <span class="text-xl">+</span>
        {{ addButtonText }}
      </Action>
    </slot>
  </div>
</template>

