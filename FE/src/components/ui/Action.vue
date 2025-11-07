<script setup lang="ts">
interface ActionProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  ariaLabel?: string
  tabindex?: number
}

const props = withDefaults(defineProps<ActionProps>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  tabindex: 0
})

const emit = defineEmits<{
  click: [event: MouseEvent]
  keydown: [event: KeyboardEvent]
}>()

function handleClick(event: MouseEvent) {
  if (props.disabled) return
  emit('click', event)
}

function handleKeyDown(event: KeyboardEvent) {
  if (props.disabled) return
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    const syntheticEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window
    })
    handleClick(syntheticEvent)
  }
  emit('keydown', event)
}

const variantClasses = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500',
  secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus-visible:ring-gray-500',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500',
  ghost: 'text-gray-700 hover:bg-gray-100 focus-visible:ring-gray-500',
  outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 focus-visible:ring-blue-500'
}

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base'
}

const baseClasses = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
</script>

<template>
  <div
    :tabindex="disabled ? -1 : tabindex"
    :aria-label="ariaLabel"
    :class="[
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      disabled && 'pointer-events-none'
    ]"
    @click="handleClick"
    @keydown="handleKeyDown"
  >
    <slot />
  </div>
</template>

