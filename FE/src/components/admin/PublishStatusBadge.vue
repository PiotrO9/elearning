<script setup lang="ts">
import Action from '@/components/ui/Action.vue'

interface PublishStatusBadgeProps {
  isPublished: boolean
  clickable?: boolean
}

const props = withDefaults(defineProps<PublishStatusBadgeProps>(), {
  clickable: false
})

const emit = defineEmits<{
  toggle: []
}>()

function handleToggle() {
  if (props.clickable) {
    emit('toggle')
  }
}
</script>

<template>
  <Action
    v-if="clickable"
    @click="handleToggle"
    variant="ghost"
    size="sm"
    aria-label="Zmień status publikacji"
  >
    <span
      :class="[
        'px-3 py-1 rounded-full text-xs font-medium transition-colors',
        isPublished
          ? 'bg-green-100 text-green-700'
          : 'bg-gray-100 text-gray-700'
      ]"
    >
      {{ isPublished ? 'Opublikowany' : 'Wersja robocza' }}
    </span>
  </Action>
  <span
    v-else
    :class="[
      'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium',
      isPublished
        ? 'bg-green-100 text-green-700'
        : 'bg-gray-100 text-gray-700'
    ]"
  >
    {{ isPublished ? 'Opublikowany' : 'Wersja robocza' }}
  </span>
</template>

