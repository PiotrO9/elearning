<script setup lang="ts">
interface Props {
  currentPage: number
  totalItems: number
  itemsPerPage: number
  maxVisiblePages?: number
}

const props = withDefaults(defineProps<Props>(), {
  maxVisiblePages: 5
})

const emit = defineEmits<{
  'update:currentPage': [page: number]
  'page-change': [page: number]
}>()

const totalPages = computed(() => Math.ceil(props.totalItems / props.itemsPerPage))

const startItem = computed(() => {
  if (props.totalItems === 0) return 0
  return (props.currentPage - 1) * props.itemsPerPage + 1
})

const endItem = computed(() => {
  return Math.min(props.currentPage * props.itemsPerPage, props.totalItems)
})

const visiblePages = computed(() => {
  const pages: number[] = []
  const half = Math.floor(props.maxVisiblePages / 2)
  let start = Math.max(1, props.currentPage - half)
  const end = Math.min(totalPages.value, start + props.maxVisiblePages - 1)

  if (end - start < props.maxVisiblePages - 1) {
    start = Math.max(1, end - props.maxVisiblePages + 1)
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return pages
})

function handlePageChange(page: number) {
  if (page < 1 || page > totalPages.value || page === props.currentPage) return
  emit('update:currentPage', page)
  emit('page-change', page)
}

function handlePrevious() {
  if (props.currentPage > 1) {
    handlePageChange(props.currentPage - 1)
  }
}

function handleNext() {
  if (props.currentPage < totalPages.value) {
    handlePageChange(props.currentPage + 1)
  }
}
</script>

<template>
  <div v-if="totalPages > 1" class="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 bg-white border-t border-gray-200">
    <div class="text-sm text-gray-700">
      <span class="font-medium">{{ startItem }}</span>
      -
      <span class="font-medium">{{ endItem }}</span>
      z
      <span class="font-medium">{{ totalItems }}</span>
    </div>

    <div class="flex items-center gap-1">
      <button
        @click="handlePrevious"
        :disabled="currentPage === 1"
        :aria-label="'Poprzednia strona'"
        tabindex="0"
        class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-50 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        @keydown="(e) => e.key === 'Enter' && handlePrevious()"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <template v-for="page in visiblePages" :key="page">
        <button
          v-if="page === 1 || page === totalPages || visiblePages.includes(page)"
          @click="handlePageChange(page)"
          :aria-label="`Strona ${page}`"
          :aria-current="page === currentPage ? 'page' : undefined"
          tabindex="0"
          :class="[
            'px-4 py-2 text-sm font-medium border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors',
            page === currentPage
              ? 'z-10 bg-purple-600 text-white border-purple-600'
              : 'bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900',
            page === visiblePages[0] && page !== 1 ? 'border-l-0' : '',
            page === visiblePages[visiblePages.length - 1] && page !== totalPages ? 'border-r-0' : ''
          ]"
          @keydown="(e) => e.key === 'Enter' && handlePageChange(page)"
        >
          {{ page }}
        </button>
        <span
          v-else-if="page === visiblePages[0] - 1 || page === visiblePages[visiblePages.length - 1] + 1"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300"
        >
          ...
        </span>
      </template>

      <button
        @click="handleNext"
        :disabled="currentPage === totalPages"
        :aria-label="'Następna strona'"
        tabindex="0"
        class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-50 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        @keydown="(e) => e.key === 'Enter' && handleNext()"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  </div>
</template>

