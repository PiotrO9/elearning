<!-- todo: Refactor -->

<script lang="ts" setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'

type CarouselProps = {
    images: string[]
    autoPlay?: boolean
    autoPlayInterval?: number
}

const props = withDefaults(defineProps<CarouselProps>(), {
    autoPlay: false,
    autoPlayInterval: 3000,
})

const currentIndex = ref(0)
let intervalId: ReturnType<typeof setInterval> | null = null

const goToSlide = (index: number) => {
    currentIndex.value = index
}

const nextSlide = () => {
    currentIndex.value = (currentIndex.value + 1) % props.images.length
}

const prevSlide = () => {
    currentIndex.value = (currentIndex.value - 1 + props.images.length) % props.images.length
}

const startAutoPlay = () => {
    if (props.autoPlay && props.images.length > 1) {
        intervalId = setInterval(() => {
            nextSlide()
        }, props.autoPlayInterval)
    }
}

const stopAutoPlay = () => {
    if (intervalId) {
        clearInterval(intervalId)
        intervalId = null
    }
}

watch(
    () => props.autoPlay,
    (newVal) => {
        if (newVal) {
            startAutoPlay()
        } else {
            stopAutoPlay()
        }
    },
)

watch(
    () => props.autoPlayInterval,
    () => {
        if (props.autoPlay) {
            stopAutoPlay()
            startAutoPlay()
        }
    },
)

onMounted(() => {
    if (props.autoPlay) {
        startAutoPlay()
    }
})

onUnmounted(() => {
    stopAutoPlay()
})
</script>

<template>
    <div
        class="relative w-full overflow-hidden rounded-lg bg-gray-100"
        @mouseenter="stopAutoPlay"
        @mouseleave="startAutoPlay"
    >
        <!-- Images Container -->
        <div class="relative aspect-video w-full">
            <transition-group name="fade">
                <div
                    v-for="(image, index) in images"
                    :key="index"
                    v-show="index === currentIndex"
                    class="absolute inset-0"
                >
                    <img
                        :src="image"
                        :alt="`Slide ${index + 1}`"
                        class="h-full w-full object-cover"
                    />
                </div>
            </transition-group>
        </div>

        <!-- Previous Button -->
        <button
            v-if="images.length > 1"
            @click="prevSlide"
            class="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-lg transition-all hover:bg-white hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Previous slide"
        >
            <svg
                class="h-6 w-6 text-gray-800"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 19l-7-7 7-7"
                />
            </svg>
        </button>

        <!-- Next Button -->
        <button
            v-if="images.length > 1"
            @click="nextSlide"
            class="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-lg transition-all hover:bg-white hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Next slide"
        >
            <svg
                class="h-6 w-6 text-gray-800"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 5l7 7-7 7"
                />
            </svg>
        </button>

        <!-- Dots Navigation -->
        <div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            <button
                v-for="(image, index) in images"
                :key="`dot-${index}`"
                @click="goToSlide(index)"
                :class="[
                    'h-3 w-3 rounded-full transition-all duration-300 focus-within:ring-primary focus:outline-none focus:ring-2 focus:ring-offset-2',
                    index === currentIndex
                        ? 'bg-primary scale-125 shadow-lg'
                        : 'bg-primary/40 hover:bg-primary/100 hover:scale-110',
                ]"
                :aria-label="`Go to slide ${index + 1}`"
                :aria-current="index === currentIndex ? 'true' : 'false'"
            ></button>
        </div>
    </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
