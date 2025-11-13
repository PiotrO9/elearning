<script setup lang="ts">
import ChangePassword from '@/components/profile/ChangePassword.vue'
import ProfileCard from '@/components/profile/ProfileCard.vue'
import MaxWidthWrapper from '@/components/wrappers/MaxWidthWrapper.vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
</script>

<template>
    <MaxWidthWrapper>
        <div class="py-12">
            <h1 class="text-4xl font-bold text-gray-900 mb-4">Mój Profil</h1>
            <p>Zobacz swój profil i edytuj go.</p>
            <div class="grid mg:grid-cols-2 grid-cols-3 items-baseline gap-6 mt-6">
                <ProfileCard v-if="authStore.user" :user="authStore.user" />
                <ChangePassword />
            </div>
        </div>
    </MaxWidthWrapper>
</template>
