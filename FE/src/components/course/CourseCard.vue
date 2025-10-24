<script setup lang="ts">
import type { Course } from '../../types/Course'
import { handleKeyboardAction } from '../../utils/courseUtils'

interface Props {
  course: Course
}

defineProps<Props>()

const emit = defineEmits<{
  click: [courseId: number]
}>()

function handleClick(courseId: number) {
  emit('click', courseId)
}

function handleKeyDown(event: KeyboardEvent, courseId: number) {
  handleKeyboardAction(event, () => handleClick(courseId))
}
</script>

<template>
  <article
    class="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer group"
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
        class="absolute top-4 right-4 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold"
      >
        ⭐ Popularny
      </div>
    </div>

    <div class="p-6">
      <h2 class="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors flex flex-1">
        {{ course.title }}
      </h2>

      <p class="text-gray-600 text-sm mb-4 line-clamp-2 flex flex-1">
        {{ course.description }}
      </p>

      <p class="text-sm text-gray-500 mb-4">
        👤 {{ course.instructor }}
      </p>

      <div class="flex flex-wrap gap-2 mb-4">
        <span
          v-for="tag in course.tags"
          :key="tag"
          class="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium"
        >
          {{ tag }}
        </span>
      </div>

      <div class="pt-4 border-t border-gray-100">
        <button
          class="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          :aria-label="`Zobacz szczegóły kursu ${course.title}`"
          @click.stop="handleClick(course.id)"
        >
          Zobacz szczegóły
        </button>
      </div>
    </div>
  </article>
</template>

