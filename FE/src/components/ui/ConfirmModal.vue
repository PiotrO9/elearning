<script setup lang="ts">
import Action from '@/components/ui/Action.vue'

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

const variantMap: Record<string, 'danger' | 'primary' | 'secondary'> = {
  danger: 'danger',
  warning: 'secondary',
  info: 'primary'
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
      <Action
        @click="handleCancel"
        variant="ghost"
        size="md"
        :disabled="isLoading"
        :aria-label="cancelText"
      >
        {{ cancelText }}
      </Action>
      <Action
        @click="handleConfirm"
        :variant="variantMap[variant]"
        size="md"
        :disabled="isLoading"
        :aria-label="confirmText"
      >
        <span v-if="isLoading">Przetwarzanie...</span>
        <span v-else>{{ confirmText }}</span>
      </Action>
    </template>
  </Dialog>
</template>

