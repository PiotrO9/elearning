<script setup lang="ts">
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Icon } from '@iconify/vue'
import MaxWidthWrapper from './wrappers/MaxWidthWrapper.vue'
import { ref } from 'vue'

const authStore = useAuthStore()
const router = useRouter()

const isHamburgerOpen = ref(false)

async function handleLogout() {
    await authStore.logout()
    router.push('/auth')
    closeHamburger()
}

function closeHamburger() {
    isHamburgerOpen.value = false
}

// TODO: Nawigacja linki nested json najlepiej albo z footer links przeniesc do utilsów
// TODO: Close button
// TODO: Style jakieś fajne
</script>

<template>
    <MaxWidthWrapper class="flex justify-between items-center py-4">
        <RouterLink to="/" class="italic font-semibold text-2xl">eLearning</RouterLink>
        <nav class="flex space-x-4 text-sm items-center">
            <RouterLink to="/courses">Kursy</RouterLink>

            <button
                class="p-2 bg-background-dark/10 hover:bg-background-dark/20 duration-300 rounded cursor-pointer"
                @click="isHamburgerOpen = !isHamburgerOpen"
            >
                <Icon icon="fa-solid:bars" class="text-2xl" />
            </button>
        </nav>
    </MaxWidthWrapper>
    <Transition name="from-right">
        <div
            class="fixed right-0 top-0 w-3/4 md:w-1/3 h-full bg-surface shadow-xl z-50 px-6 py-12 flex flex-col"
            v-if="isHamburgerOpen"
        >
            <h1 class="text-3xl font-semibold italic">MENU</h1>
            <template v-if="authStore.isAuthenticated">
                <RouterLink
                    to="/profile"
                    class="text-blue-600 hover:underline"
                    @click="closeHamburger"
                >
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
                <RouterLink to="/auth" @click="closeHamburger">Logowanie</RouterLink>
                <RouterLink to="/auth?mode=register" @click="closeHamburger"
                    >Rejestracja</RouterLink
                >
            </template>
        </div>
    </Transition>
    <Transition name="fade-in">
        <template v-if="isHamburgerOpen">
            <div
                class="fixed w-full h-full left-0 top-0 backdrop-blur-sm z-40"
                @click="closeHamburger"
            ></div>
        </template>
    </Transition>
</template>

<style scoped>
.from-right-enter-active,
.from-right-leave-active {
    transition: transform 0.3s ease;
}

.from-right-enter-from,
.from-right-leave-to {
    transform: translateX(100%);
}

.fade-in-enter-active,
.fade-in-leave-active {
    transition: opacity 0.3s ease;
}

.fade-in-enter-from,
.fade-in-leave-to {
    opacity: 0;
}
</style>
