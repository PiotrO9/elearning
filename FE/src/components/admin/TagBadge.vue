<script setup lang="ts">
import { computed } from 'vue'
import type { Tag } from '@/types/Admin'

interface TagBadgeProps {
  tag: Tag | string
  variant?: 'default' | 'secondary'
}

const props = withDefaults(defineProps<TagBadgeProps>(), {
  variant: 'default'
})

const tagName = computed(() => {
  return typeof props.tag === 'string' ? props.tag : props.tag.name
})
</script>

<template>
  <span
    :class="[
      'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium transition-colors',
      variant === 'default'
        ? 'bg-blue-100 text-blue-700'
        : 'bg-gray-100 text-gray-600'
    ]"
  >
    {{ tagName }}
  </span>
</template>

