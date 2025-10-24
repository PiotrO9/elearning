<script setup lang="ts">
import RegisterCard from '@/components/RegisterCard.vue'
import Carousel from '@/components/Carousel.vue'
import MaxWidthWrapper from '@/components/wrappers/MaxWidthWrapper.vue'
</script>

<template>
    <MaxWidthWrapper size="lg">
        <div class="min-h-[80vh] grid grid-cols-2 grid-rows-3 py-6">
            <RegisterCard class="row-start-2" />
            <Carousel
                class="row-span-3"
                :images="['/placeholder.jpg', 'placeholder.webp']"
                auto-play
                :auto-play-interval="5000"
            />
        </div>
    </MaxWidthWrapper>
</template>
