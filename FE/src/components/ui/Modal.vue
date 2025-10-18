<script lang="ts" setup>
    defineProps<{
        isOpen: boolean
    }>()

    defineEmits<{
        'update:isOpen': [value: boolean]
    }>()
</script>

<template>
    <TransitionGroup>
        <div v-if="isOpen" @click="isOpen = false" class="fixed left-0 top-0 w-full h-full backdrop-blur-sm z-0"></div>
        <div class="fixed top-0 h-screen w-full" v-if="isOpen">
            <div class="h-full flex justify-center items-center z-50">
                <slot />
            </div>
        </div>
    </TransitionGroup>
</template>

<style scoped>
    .v-enter-active,
    .v-leave-active {
    transition: opacity 0.3s ease;
    }

    .v-enter-from,
    .v-leave-to {
    opacity: 0;
    }
</style>
