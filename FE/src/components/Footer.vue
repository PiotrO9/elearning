<script setup lang="ts">
import MaxWidthWrapper from './wrappers/MaxWidthWrapper.vue';

    const links = [
        { name: 'Strona Główna', url: '/' },
        { name: 'Polityka Prywatności', url: '/privacy' },
    ]
</script>

<template>
    <footer class="w-full">
        <hr class="border-blue-100"/>
        <MaxWidthWrapper class="py-6">
            <h1>Footer</h1>
        </MaxWidthWrapper>
    </footer>
</template>