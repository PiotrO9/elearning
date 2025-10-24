<script setup lang="ts">
import { computed } from 'vue'
import { getInitials } from '../../utils/courseUtils'

interface Props {
  name: string
  size?: 'sm' | 'md' | 'lg'
  gradientFrom?: string
  gradientTo?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  gradientFrom: 'blue-500',
  gradientTo: 'purple-600',
})

const initials = computed(() => getInitials(props.name))

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'w-10 h-10 text-sm'
    case 'md':
      return 'w-12 h-12 text-lg'
    case 'lg':
      return 'w-16 h-16 text-xl'
    default:
      return 'w-12 h-12 text-lg'
  }
})

const gradientClasses = computed(() => {
  return `from-${props.gradientFrom} to-${props.gradientTo}`
})
</script>

<template>
  <div
    :class="[
      'bg-gradient-to-br rounded-full flex items-center justify-center text-white font-bold flex-shrink-0',
      sizeClasses,
      gradientClasses
    ]"
    :aria-label="`Avatar użytkownika ${name}`"
  >
    {{ initials }}
  </div>
</template>

