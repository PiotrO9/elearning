<script setup lang="ts">
import { computed } from 'vue'
import Icon from '@/components/ui/Icon.vue'

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

const visiblePages = computed(() => {
    if (totalPages.value <= props.maxVisiblePages) {
        return Array.from({ length: totalPages.value }, (_, i) => i + 1)
    }

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

const showFirstPage = computed(() => {
    const firstPage = visiblePages.value[0]
    return totalPages.value > props.maxVisiblePages && firstPage !== undefined && firstPage > 1
})

const showLastPage = computed(() => {
    const lastVisiblePage = visiblePages.value[visiblePages.value.length - 1]
    return totalPages.value > props.maxVisiblePages && lastVisiblePage !== undefined && lastVisiblePage < totalPages.value
})

const showStartEllipsis = computed(() => {
    const firstPage = visiblePages.value[0]
    return showFirstPage.value && firstPage !== undefined && firstPage > 2
})

const showEndEllipsis = computed(() => {
    const lastVisiblePage = visiblePages.value[visiblePages.value.length - 1]
    return showLastPage.value && lastVisiblePage !== undefined && lastVisiblePage < totalPages.value - 1
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

function handleFirst() {
    handlePageChange(1)
}

function handleLast() {
    handlePageChange(totalPages.value)
}

function handleKeyDown(event: KeyboardEvent, action: () => void) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        action()
    }
}
</script>

<template>
<div
    v-if="totalPages > 1"
    class="flex items-center justify-center px-4 py-4 bg-white border-t border-gray-200"
>
    <nav
        class="flex items-center justify-center gap-1"
        aria-label="Nawigacja paginacji"
    >
        <button
            type="button"
            :disabled="currentPage === 1"
            :aria-label="'Poprzednia strona'"
            :aria-disabled="currentPage === 1"
            tabindex="0"
            class="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-300 transition-all"
            @click="handlePrevious"
            @keydown="(e) => handleKeyDown(e, handlePrevious)"
        >
            <Icon
                name="arrow-left"
                class="w-5 h-5"
                aria-hidden="true"
            />
        </button>

        <button
            v-if="showFirstPage"
            type="button"
            :aria-label="'Strona 1'"
            :aria-current="currentPage === 1 ? 'page' : undefined"
            tabindex="0"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all"
            :class="currentPage === 1 ? 'bg-purple-600 text-white border-purple-600 hover:bg-purple-700 hover:border-purple-700' : ''"
            @click="handleFirst"
            @keydown="(e) => handleKeyDown(e, () => handleFirst())"
        >
            1
        </button>

        <span
            v-if="showStartEllipsis"
            class="px-2 py-2 text-sm text-gray-500"
            aria-hidden="true"
        >
            ...
        </span>

        <button
            v-for="page in visiblePages"
            :key="page"
            type="button"
            :aria-label="`Strona ${page}`"
            :aria-current="page === currentPage ? 'page' : undefined"
            tabindex="0"
            class="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all"
            :class="
                page === currentPage
                    ? 'bg-purple-600 text-white border-purple-600 hover:bg-purple-700 hover:border-purple-700'
                    : 'bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400'
            "
            @click="handlePageChange(page)"
            @keydown="(e) => handleKeyDown(e, () => handlePageChange(page))"
        >
            {{ page }}
        </button>

        <span
            v-if="showEndEllipsis"
            class="px-2 py-2 text-sm text-gray-500"
            aria-hidden="true"
        >
            ...
        </span>

        <button
            v-if="showLastPage"
            type="button"
            :aria-label="`Strona ${totalPages}`"
            :aria-current="currentPage === totalPages ? 'page' : undefined"
            tabindex="0"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all"
            :class="currentPage === totalPages ? 'bg-purple-600 text-white border-purple-600 hover:bg-purple-700 hover:border-purple-700' : ''"
            @click="handleLast"
            @keydown="(e) => handleKeyDown(e, () => handleLast())"
        >
            {{ totalPages }}
        </button>

        <button
            type="button"
            :disabled="currentPage === totalPages"
            :aria-label="'Następna strona'"
            :aria-disabled="currentPage === totalPages"
            tabindex="0"
            class="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-300 transition-all"
            @click="handleNext"
            @keydown="(e) => handleKeyDown(e, handleNext)"
        >
            <Icon
                name="arrow-right"
                class="w-5 h-5"
                aria-hidden="true"
            />
        </button>
    </nav>
</div>
</template>

