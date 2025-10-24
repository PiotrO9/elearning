<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
</script>

<template>
    <div class="max-w-4xl mx-auto p-6">
        <h1 class="text-3xl font-bold mb-4">Profil Użytkownika</h1>

        <div class="bg-white p-6 rounded-lg shadow">
            <h2 class="text-xl font-semibold mb-4">Twoje dane</h2>

            <div class="space-y-2">
                <p><span class="font-medium">ID:</span> {{ authStore.user?.id }}</p>
                <p><span class="font-medium">Email:</span> {{ authStore.user?.email }}</p>
                <p>
                    <span class="font-medium">Nazwa użytkownika:</span>
                    {{ authStore.user?.username }}
                </p>
            </div>
        </div>
    </div>
</template>
