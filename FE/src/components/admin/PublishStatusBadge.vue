<script setup lang="ts">
interface PublishStatusBadgeProps {
    isPublished: boolean
}

defineProps<PublishStatusBadgeProps>()
</script>

<template>
<span
    :class="[
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-center',
        isPublished
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-gray-50 text-gray-700 border border-gray-200'
    ]"
>
    <span>{{ isPublished ? 'Opublikowany' : 'Wersja robocza' }}</span>
</span>
</template>

