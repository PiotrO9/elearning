<script setup lang="ts">
import { computed } from 'vue'
import type { Tag } from '@/types/Admin'
import TagBadge from './TagBadge.vue'

interface TagListProps {
    tags?: (Tag | string)[]
    maxVisible?: number
    showCount?: boolean
}

const props = withDefaults(defineProps<TagListProps>(), {
    tags: () => [],
    maxVisible: 2,
    showCount: true
})

const visibleTags = computed(() => {
    if (!props.tags || props.tags.length === 0) return []
    return props.tags.slice(0, props.maxVisible)
})

const remainingCount = computed(() => {
    if (!props.tags) return 0
    return Math.max(0, props.tags.length - props.maxVisible)
})
</script>

<template>
<div class="flex flex-wrap gap-1">
    <TagBadge
        v-for="tag in visibleTags"
        :key="typeof tag === 'string' ? tag : tag.id"
        :tag="tag"
    />
    <TagBadge
        v-if="remainingCount > 0 && showCount"
        :tag="`+${remainingCount}`"
        variant="secondary"
    />
</div>
</template>

