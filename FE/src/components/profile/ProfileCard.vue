<script lang="ts" setup>
import { computed } from 'vue'
import type { User } from '@/types/user'

const props = defineProps<{ user: User }>()

const userInitials = computed(() => {
    if (!props.user.username) return '?'
    const names = props.user.username.split(' ')
    if (names.length >= 2 && names[0]?.[0] && names[1]?.[0]) {
        return (names[0][0] + names[1][0]).toUpperCase()
    }
    return props.user.username.substring(0, 2).toUpperCase()
})
</script>

<template>
<div class="bg-white rounded-2xl shadow-md border border-border overflow-hidden">
    <div class="bg-gradient-to-r bg-white border-b border-primary p-6">
        <h3 class="text-xl font-bold text-text">Informacje o profilu</h3>
    </div>

    <div class="p-6">
        <div class="flex items-center gap-4 mb-6 pb-6 border-b border-border">
            <div
                class="w-20 h-20 bg-gradient-to-br from-primary to-footer-bg rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-md"
            >
                {{ userInitials }}
            </div>
            <div class="flex-1">
                <h4 class="text-2xl font-bold text-text mb-1">{{ user.username }}</h4>
                <p class="text-text-muted text-sm">Profil</p>
            </div>
        </div>

        <div class="space-y-4">
            <div>
                <label class="text-sm font-semibold text-text-muted block mb-1">Email</label>
                <p class="text-base text-text">{{ user.email }}</p>
            </div>

            <div>
                <label class="text-sm font-semibold text-text-muted block mb-1"
                >ID Użytkownika</label
                >
                <p class="text-base text-text font-mono">{{ user.id.substring(0, 16) }}...</p>
            </div>
        </div>
    </div>
</div>
</template>
