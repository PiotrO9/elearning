<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MaxWidthWrapper from '@/components/wrappers/MaxWidthWrapper.vue'
import Icon from '@/components/ui/Icon.vue'

const route = useRoute()
const router = useRouter()

const isMobileMenuOpen = ref(false)

interface NavItem {
    path: string
    label: string
    icon: string
    exact?: boolean
}

const navItems: NavItem[] = [
    {
        path: '/admin',
        label: 'Dashboard',
        icon: 'dashboard',
        exact: true
    },
    {
        path: '/admin/courses',
        label: 'Kursy',
        icon: 'books'
    },
    {
        path: '/admin/tags',
        label: 'Tagi',
        icon: 'tags'
    },
    {
        path: '/admin/users',
        label: 'Użytkownicy',
        icon: 'users'
    }
]

function isActive(item: NavItem): boolean {
    if (item.exact) {
        return route.path === item.path
    }
    return route.path === item.path || route.path.startsWith(item.path + '/')
}

function handleNavigate(path: string) {
    router.push(path)
    isMobileMenuOpen.value = false
}

function handleKeyDown(event: KeyboardEvent, action: () => void) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        action()
    }
}
</script>

<template>
<nav class="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-1">
    <MaxWidthWrapper>
        <div class="flex items-center justify-between h-16">
            <div class="flex items-center gap-8">
                <router-link
                    to="/admin"
                    class="flex items-center gap-2 text-xl font-bold text-gray-900 hover:text-purple-600 transition-colors"
                    aria-label="Panel administracyjny"
                >
                    <Icon
                        name="shield"
                        class="w-6 h-6"
                    />
                    <span>Admin Panel</span>
                </router-link>

                <div class="hidden md:flex items-center gap-1">
                    <router-link
                        v-for="item in navItems"
                        :key="item.path"
                        :to="item.path"
                        :class="[
                            'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200',
                            isActive(item)
                                ? 'bg-purple-100 text-purple-700 shadow-sm'
                                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                        ]"
                        :aria-current="isActive(item) ? 'page' : undefined"
                    >
                        <Icon
                            :name="item.icon"
                            class="w-5 h-5"
                            aria-hidden="true"
                        />
                        <span>{{ item.label }}</span>
                    </router-link>
                </div>
            </div>

            <div class="flex items-center gap-4">
                <router-link
                    to="/"
                    class="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                >
                    <Icon
                        name="home"
                        class="w-5 h-5"
                    />
                    <span>Wróć do strony głównej</span>
                </router-link>

                <button
                    @click="isMobileMenuOpen = !isMobileMenuOpen"
                    @keydown="(e) => handleKeyDown(e, () => isMobileMenuOpen = !isMobileMenuOpen)"
                    class="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
                    :aria-expanded="isMobileMenuOpen"
                    aria-label="Otwórz menu"
                    aria-controls="mobile-menu"
                >
                    <Icon
                        v-if="!isMobileMenuOpen"
                        name="menu"
                        class="w-6 h-6"
                    />
                    <Icon
                        v-else
                        name="close"
                        class="w-6 h-6"
                    />
                </button>
            </div>
        </div>

        <Transition
            enter-active-class="transition ease-out duration-200"
            enter-from-class="opacity-0 -translate-y-1"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition ease-in duration-150"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-1"
        >
            <div
                v-if="isMobileMenuOpen"
                id="mobile-menu"
                class="md:hidden border-t border-gray-200 py-4"
            >
                <div class="flex flex-col gap-1">
                    <button
                        v-for="item in navItems"
                        :key="item.path"
                        @click="handleNavigate(item.path)"
                        @keydown="(e) => handleKeyDown(e, () => handleNavigate(item.path))"
                        :class="[
                            'flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors text-left',
                            isActive(item)
                                ? 'bg-purple-100 text-purple-700'
                                : 'text-gray-700 hover:bg-gray-100'
                        ]"
                        :aria-current="isActive(item) ? 'page' : undefined"
                    >
                        <Icon
                            :name="item.icon"
                            class="w-5 h-5"
                            aria-hidden="true"
                        />
                        <span>{{ item.label }}</span>
                    </button>

                    <div class="border-t border-gray-200 mt-2 pt-2">
                        <router-link
                            to="/"
                            @click="isMobileMenuOpen = false"
                            class="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                            <Icon
                                name="home"
                                class="w-5 h-5"
                            />
                            Wróć do strony głównej
                        </router-link>
                    </div>
                </div>
            </div>
        </Transition>
    </MaxWidthWrapper>

    <Transition
        enter-active-class="transition-opacity ease-linear duration-200"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity ease-linear duration-200"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
    >
        <div
            v-if="isMobileMenuOpen"
            class="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            @click="isMobileMenuOpen = false"
            aria-hidden="true"
        />
    </Transition>
</nav>
</template>

