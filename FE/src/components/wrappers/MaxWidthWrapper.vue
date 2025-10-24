<script setup lang="ts">
type sizeType = 'sm' | 'md' | 'lg'

defineProps<{
    size?: sizeType
}>()

const standardSize = 'md'

const sizeClasses = {
    sm: 'max-w-5xl px-4 lg:px-0 mx-auto w-full',
    md: 'max-w-7xl px-4 xl:px-0 mx-auto w-full',
    lg: 'w-full px-4 md:px-16 lg:px-32',
}
</script>

<template>
    <div :class="sizeClasses[size ? size : standardSize]">
        <slot />
    </div>
</template>
