<script setup lang="ts">
import { useHead } from '@vueuse/head'

useHead({
    title: 'Nie Znaleziono - E-Learning Platforma',
})
</script>

<template>
    <div class="min-h-[80vh] flex flex-col justify-center items-center bg-gray-50">
        <h1 class="text-4xl font-bold mb-4">Strona nie znaleziona</h1>
        <p class="text-lg mb-8">Przepraszamy, ale strona, której szukasz, nie istnieje.</p>
        <RouterLink
            to="/"
            class="px-4 py-2 bg-primary text-white rounded hover:bg-button-primary-hover transition-colors duration-300"
        >
            Powrót do strony głównej
        </RouterLink>
    </div>
</template>
