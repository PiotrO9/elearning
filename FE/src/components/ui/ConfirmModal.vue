<script setup lang="ts">
interface Props {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
  isLoading?: boolean
}

withDefaults(defineProps<Props>(), {
  confirmText: 'Potwierdź',
  cancelText: 'Anuluj',
  variant: 'danger',
  isLoading: false
})

const emit = defineEmits<{
  confirm: []
  cancel: []
  'update:isOpen': [value: boolean]
}>()

function handleConfirm() {
  emit('confirm')
}

function handleCancel() {
  emit('cancel')
  emit('update:isOpen', false)
}

const variantClasses: Record<string, string> = {
  danger: 'bg-red-600 hover:bg-red-700',
  warning: 'bg-yellow-600 hover:bg-yellow-700',
  info: 'bg-blue-600 hover:bg-blue-700'
}
</script>

<template>
  <Dialog :is-open="isOpen" size="md" @update:is-open="handleCancel" @close="handleCancel">
    <template #title>
      <h3 class="text-xl font-bold text-gray-900">
        {{ title }}
      </h3>
    </template>

    <p class="text-gray-700">
      {{ message }}
    </p>

    <template #footer>
      <button
        type="button"
        @click="handleCancel"
        class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        :disabled="isLoading"
      >
        {{ cancelText }}
      </button>
      <button
        type="button"
        @click="handleConfirm"
        :class="[
          'px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
          variantClasses[variant]
        ]"
        :disabled="isLoading"
      >
        <span v-if="isLoading">Przetwarzanie...</span>
        <span v-else>{{ confirmText }}</span>
      </button>
    </template>
  </Dialog>
</template>

