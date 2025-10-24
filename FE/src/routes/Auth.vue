<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import LoginCard from '@/components/LoginCard.vue'
import RegisterCard from '@/components/RegisterCard.vue'
import Carousel from '@/components/Carousel.vue'
import MaxWidthWrapper from '@/components/wrappers/MaxWidthWrapper.vue'

type mode = 'login' | 'register'

const currentMode = ref<mode>('login')
const router = useRoute()

watch(
    () => router.query.mode,
    (newMode) => {
        if (newMode === 'register') {
            currentMode.value = 'register'
        } else {
            currentMode.value = 'login'
        }
    },
)

onMounted(() => {
    currentMode.value = router.query.mode === 'register' ? 'register' : 'login'
})
</script>

<template>
    <MaxWidthWrapper size="lg">
        <div
            class="min-h-[80vh] flex flex-col lg:flex-row gap-24 lg:gap-6 justify-between items-center py-6"
        >
            <LoginCard v-if="currentMode === 'login'" />
            <RegisterCard v-else-if="currentMode === 'register'" />
            <Carousel
                class="max-w-5xl"
                :images="['/placeholder.jpg', '/placeholder.webp']"
                auto-play
                :auto-play-interval="5000"
            />
        </div>
    </MaxWidthWrapper>
</template>
