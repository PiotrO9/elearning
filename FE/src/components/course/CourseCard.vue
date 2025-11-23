<script setup lang="ts">
import type { Course } from '../../types/Course'
import { handleKeyboardAction } from '../../utils/courseUtils'

interface Props {
    course: Course
}

defineProps<Props>()

const emit = defineEmits<{
    click: [courseId: string]
}>()

function handleClick(courseId: string) {
    emit('click', courseId)
}

function handleKeyDown(event: KeyboardEvent, courseId: string) {
    handleKeyboardAction(event, () => handleClick(courseId))
}
</script>

<template>
    <article
        class="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer group border-2 border-transparent hover:border-primary/50"
        :aria-label="`Kurs: ${course.title}`"
        tabindex="0"
        @click="handleClick(course.id)"
        @keydown="(e) => handleKeyDown(e, course.id)"
    >
        <div class="relative overflow-hidden">
            <img
                :src="course.thumbnail"
                :alt="`Miniatura kursu ${course.title}`"
                class="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
            />
            <div
                v-if="course.isPopular"
                class="absolute top-4 right-4 bg-secondary/40 text-yellow-900 px-3 py-1 rounded-lg text-xs font-bold backdrop-blur-md"
            >
                ⭐ Popularny
            </div>
        </div>

        <div class="p-6 flex flex-col h-[calc(100%-11.5rem)]">
            <h2
                class="text-xl font-bold text-gray-900 mb-3 group-hover:text-button-primary-hover transition-colors"
            >
                {{ course.title }}
            </h2>

            <p class="text-gray-600 text-sm mb-4 line-clamp-3 text-ellipsis">
                {{ course.description }}
            </p>

            <p class="text-sm text-gray-500 mb-4">
                👤 {{ course.instructors?.map((instructor) => instructor.username).join(', ') }}
            </p>

            <div class="flex flex-wrap gap-2 mb-4">
                <span
                    v-for="tag in course.tags"
                    :key="tag.id"
                    class="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-medium"
                >
                    {{ tag.name }}
                </span>
            </div>

            <div class="flex-1 flex flex-col justify-end">
                <hr
                    class="bg-zinc-100 border-0 h-[2px] mt-6 mb-4 w-full mx-auto max-w-[60%] rounded-full"
                />
                <button
                    class="w-full bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-button-primary-hover transition-colors"
                    :aria-label="`Zobacz szczegóły kursu ${course.title}`"
                    @click.stop="handleClick(course.id)"
                >
                    Zobacz szczegóły
                </button>
            </div>
        </div>
    </article>
</template>
