<script setup lang="ts">
import { computed } from 'vue'
import Icon from '@/components/ui/Icon.vue'

interface AdminTableSearchProps {
  modelValue: string
  placeholder?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<AdminTableSearchProps>(), {
  placeholder: 'Szukaj...',
  disabled: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const hasValue = computed(() => props.modelValue.length > 0)

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

function handleClear() {
  emit('update:modelValue', '')
}

function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'Escape' && hasValue.value) {
    handleClear()
  }
}
</script>

<template>
  <div class="relative w-full">
    <div class="relative flex items-center">
      <div class="absolute left-4 z-10 pointer-events-none">
        <Icon
          name="search"
          class="w-5 h-5 text-gray-400"
          aria-hidden="true"
        />
      </div>

      <input
        :value="modelValue"
        type="text"
        :placeholder="placeholder"
        :disabled="disabled"
        class="w-full pl-12 pr-12 py-3.5 bg-white border-2 border-gray-200 rounded-xl shadow-sm text-gray-900 placeholder-gray-400 transition-all duration-200 focus-visible:outline-none focus-visible:border-blue-500 focus-visible:ring-4 focus-visible:ring-blue-100 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-200"
        @input="handleInput"
        @keydown="handleKeyDown"
      />

      <button
        v-if="hasValue && !disabled"
        type="button"
        class="absolute right-3 z-10 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        tabindex="0"
        aria-label="Wyczyść wyszukiwanie"
        @click="handleClear"
        @keydown="(e) => e.key === 'Enter' && handleClear()"
      >
        <Icon
          name="close"
          class="w-5 h-5"
          aria-hidden="true"
        />
      </button>
    </div>
  </div>
</template>

