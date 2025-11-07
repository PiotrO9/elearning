<script setup lang="ts">
import { watch, ref, onMounted, onBeforeUnmount } from 'vue'

interface Props {
  isOpen: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md'
})

const emit = defineEmits<{
  'update:isOpen': [value: boolean]
  close: []
}>()

const dialogRef = ref<HTMLDialogElement | null>(null)

const sizeClasses: Record<string, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-full'
}

function handleClose() {
  emit('update:isOpen', false)
  emit('close')
}

function handleCancel(event: Event) {
  // Prevent default close behavior and emit our own event
  event.preventDefault()
  handleClose()
}

function handleDialogClose() {
  // This is called when dialog closes natively (ESC key or backdrop click)
  // We need to sync the state
  emit('update:isOpen', false)
  emit('close')
}

watch(() => props.isOpen, (isOpen) => {
  if (!dialogRef.value) return

  if (isOpen) {
    // Use nextTick to ensure dialog is in DOM
    setTimeout(() => {
      if (dialogRef.value) {
        dialogRef.value.showModal()
      }
    }, 0)
  } else {
    dialogRef.value.close()
  }
})

onMounted(() => {
  if (!dialogRef.value) return

  // Listen for native close event
  dialogRef.value.addEventListener('close', handleDialogClose)

  // Open dialog if isOpen is true on mount
  if (props.isOpen) {
    setTimeout(() => {
      if (dialogRef.value) {
        dialogRef.value.showModal()
      }
    }, 0)
  }
})

onBeforeUnmount(() => {
  if (dialogRef.value) {
    dialogRef.value.removeEventListener('close', handleDialogClose)
  }
})
</script>

<template>
  <dialog
    v-if="isOpen"
    ref="dialogRef"
    class="dialog"
    @cancel="handleCancel"
  >
    <div
      :class="[
        'dialog-content',
        sizeClasses[size]
      ]"
      @click.stop
    >
      <slot name="header">
        <div v-if="$slots.title" class="dialog-header">
          <slot name="title" />
        </div>
      </slot>

      <div class="dialog-body">
        <slot />
      </div>

      <div v-if="$slots.footer" class="dialog-footer">
        <slot name="footer" />
      </div>
    </div>
  </dialog>
</template>

<style scoped>
.dialog {
  position: fixed;
  inset: 0;
  z-index: 50;
  margin: 0;
  padding: 0;
  width: 100%;
  max-width: 100%;
  height: 100%;
  max-height: 100%;
  border: none;
  background: transparent;
  overflow: visible;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dialog::backdrop {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  animation: fadeIn 0.2s ease-out;
}

.dialog[open] {
  animation: fadeIn 0.2s ease-out;
}

.dialog-content {
  position: relative;
  width: auto;
  max-height: 90vh;
  margin: 0 auto;
  padding: 0;
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease-out;
}

.dialog-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.dialog-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.dialog-footer {
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  flex-shrink: 0;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Responsive */
@media (max-width: 640px) {
  .dialog-content {
    margin: 1rem;
    max-height: calc(100vh - 2rem);
  }

  .dialog-header,
  .dialog-body,
  .dialog-footer {
    padding: 1rem;
  }
}
</style>

