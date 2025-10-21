<script setup lang="ts">
import LoginCard from '@/components/LoginCard.vue'
import Modal from '@/components/ui/Modal.vue'
import { ref } from 'vue'

const isopen = ref<boolean>(false)
</script>

<template>
    <div>
        <div class="border-3 w-32 h-32 border-dotted scale-3d rounded-full animate-spins" />
        <p v-on:click="isopen = true">open</p>
        <Modal v-on:update:is-open="isopen = false" :is-open="isopen">
            <LoginCard />
        </Modal>
    </div>
</template>

<style scoped>
@keyframes spin {
    0% {
        transform: rotateZ(0deg);
    }
    100% {
        transform: rotateZ(360deg);
    }
}

.animate-spins {
    animation: spin 20s linear infinite;
}
</style>
