<script setup lang="ts">
import { ref } from 'vue'

interface CopyableTextProps {
  text: string
  label?: string
  showIcon?: boolean
}

const props = withDefaults(defineProps<CopyableTextProps>(), {
  showIcon: true
})

const isCopied = ref(false)
const copyTimeout = ref<number | null>(null)

async function handleCopy() {
  try {
    await navigator.clipboard.writeText(props.text)
    isCopied.value = true

    if (copyTimeout.value) {
      clearTimeout(copyTimeout.value)
    }

    copyTimeout.value = window.setTimeout(() => {
      isCopied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy text:', err)
  }
}

function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    handleCopy()
  }
}
</script>

<template>
  <div class="inline-flex items-center gap-1.5 group">
    <span
      v-if="label"
      class="text-sm text-gray-500"
    >
      {{ label }}
    </span>
    <span
      class="text-sm text-gray-700 font-mono select-all"
    >
      {{ text }}
    </span>
    <button
      v-if="showIcon"
      type="button"
      :aria-label="isCopied ? 'Skopiowano!' : `Kopiuj ${text}`"
      :title="isCopied ? 'Skopiowano!' : 'Kopiuj'"
      tabindex="0"
      class="inline-flex items-center justify-center p-1 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1"
      :class="isCopied ? 'text-green-600 hover:text-green-600 hover:bg-green-50' : ''"
      @click="handleCopy"
      @keydown="handleKeyDown"
    >
      <svg
        v-if="!isCopied"
        class="w-3.5 h-3.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
        />
      </svg>
      <svg
        v-else
        class="w-3.5 h-3.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M5 13l4 4L19 7"
        />
      </svg>
    </button>
  </div>
</template>

