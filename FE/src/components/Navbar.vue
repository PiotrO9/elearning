<script setup lang="ts">
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import MaxWidthWrapper from './wrappers/MaxWidthWrapper.vue'

const authStore = useAuthStore()
const router = useRouter()

async function handleLogout() {
    await authStore.logout()
    router.push('/login')
}
</script>

<template>
    <MaxWidthWrapper class="flex justify-between items-center py-4">
        <RouterLink to="/" class="italic font-semibold text-2xl">eLearning</RouterLink>
        <nav class="flex space-x-4 text-sm items-center">
            <RouterLink to="/courses">Kursy</RouterLink>

            <template v-if="authStore.isAuthenticated">
                <!-- TYMCZASOWO bez warunku authStore.isAdmin - dla testowania -->
                <RouterLink
                    to="/admin"
                    class="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                >
                    👑 Panel Admina
                </RouterLink>
                <RouterLink to="/profile" class="text-blue-600 hover:underline">
                    {{ authStore.user?.username }}
                </RouterLink>
                <button
                    @click="handleLogout"
                    class="px-3 py-1 border border-red-300 hover:border-red-400 rounded duration-300"
                >
                    Wyloguj
                </button>
            </template>

            <template v-else>
                <RouterLink to="/login">Logowanie</RouterLink>
                <RouterLink to="/register">Rejestracja</RouterLink>
            </template>
        </nav>
    </MaxWidthWrapper>
</template>
