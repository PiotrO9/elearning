<script setup lang="ts">
import MaxWidthWrapper from './wrappers/MaxWidthWrapper.vue'
import { Icon } from '@iconify/vue'
import { links, getVisibleLinks } from '@/utils/linksUtils'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
</script>

<template>
    <footer class="w-full bg-footer-bg text-text-on-dark">
        <hr class="border-blue-100" />
        <MaxWidthWrapper class="py-12 grid grid-cols-1 lg:grid-cols-2">
            <div
                class="flex flex-col gap-6 text-center lg:justify-start lg:items-start lg:text-start items-center mb-12 lg:mb-0"
            >
                <h1 class="text-3xl italic font-semibold">eLearning</h1>
                <p class="mt-2 text-sm w-1/2 mb-6">
                    Twoje kompleksowe rozwiązanie do nauki online. Oferujemy szeroki zakres kursów i
                    materiałów edukacyjnych dostosowanych do Twoich potrzeb.
                </p>
                <div class="text-5xl flex gap-4">
                    <Icon icon="fa-brands:cc-visa" class="hover:text-secondary duration-300" />
                    <Icon
                        icon="fa-brands:cc-mastercard"
                        class="hover:text-secondary duration-300"
                    />
                    <Icon icon="fa-brands:vuejs" class="hover:text-secondary duration-300" />
                </div>
            </div>
            <div
                class="flex text-center lg:text-start flex-col lg:flex-row gap-12 lg:gap-32 md:justify-end"
            >
                <div v-for="section in links" :key="section.name">
                    <h2 class="text-xl mb-6 font-semibold">{{ section.name }}</h2>
                    <ul class="flex flex-col gap-3">
                        <li
                            v-for="link in getVisibleLinks(authStore, section.sublinks)"
                            :key="link.name"
                            class="hover:text-text-on-dark-muted duration-300"
                        >
                            <RouterLink :to="link.url">
                                {{ link.name }}
                            </RouterLink>
                        </li>
                    </ul>
                </div>
            </div>
        </MaxWidthWrapper>
        <div class="bg-primary text-center py-2">
            <a
                href="https://github.com/PiotrO9/elearning/"
                target="_blank"
                class="text-sm text-text-on-dark hover:text-text-on-dark-muted duration-300 hover:underline"
                >{{ new Date().getFullYear() }} nie ma &copy; eLearning</a
            >
        </div>
    </footer>
</template>
