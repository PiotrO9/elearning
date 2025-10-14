<script setup lang="ts">
import { RouterLink } from 'vue-router';
import MaxWidthWrapper from './wrappers/MaxWidthWrapper.vue';

</script>

<template>
    <MaxWidthWrapper class="flex justify-between items-center py-4">
        <RouterLink to="/" class="italic font-semibold text-2xl">eLearning</RouterLink>
        <nav class="flex space-x-4 text-sm">
            <RouterLink to="/courses">Kursy</RouterLink>
            <RouterLink to="/login">Logowanie</RouterLink>
        </nav>
    </MaxWidthWrapper>
</template>