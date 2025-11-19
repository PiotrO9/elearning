<script lang="ts" setup>
defineProps<{
    isOpen: boolean
}>()
// TODO - Jak masz czas to możesz przepisać komponent na semantyczną wersję z użyciem Dialog
// https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog
const emit = defineEmits<{
    'update:isOpen': [value: boolean]
}>()

function close() {
    emit('update:isOpen', false)
}
</script>

<template>
<TransitionGroup>
    <div
        v-if="isOpen"
        @click="close"
        class="fixed left-0 top-0 w-full h-full backdrop-blur-sm z-0"
    ></div>
    <div class="fixed top-0 h-screen w-full" v-if="isOpen" role="dialog" aria-modal="true">
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
