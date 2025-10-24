<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { CourseListItem } from '@/types/Course'
import type { Tag } from '@/types/Admin'
import type { CreateCourseInput, UpdateCourseInput } from '@/types/Admin'

interface Props {
  course?: CourseListItem | null
  allTags: Tag[]
  isLoading?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  save: [data: CreateCourseInput | UpdateCourseInput, tagIds: string[]]
  cancel: []
}>()

const formData = ref({
  title: '',
  summary: '',
  descriptionMarkdown: '',
  imagePath: '',
  isPublished: true,
  isPublic: false,
})

const selectedTagIds = ref<string[]>([])
const errors = ref<Record<string, string>>({})

watch(() => props.course, (course) => {
  if (course) {
    formData.value = {
      title: course.title || '',
      summary: course.summary || '',
      descriptionMarkdown: course.descriptionMarkdown || course.description || '',
      imagePath: course.imagePath || course.thumbnail || '',
      isPublished: course.isPublished ?? true,
      isPublic: course.isPublic ?? false,
    }

    if (Array.isArray(course.tags)) {
      selectedTagIds.value = course.tags.map(tag =>
        typeof tag === 'string' ? tag : tag.id
      )
    }
  } else {
    resetForm()
  }
}, { immediate: true })

function resetForm() {
  formData.value = {
    title: '',
    summary: '',
    descriptionMarkdown: '',
    imagePath: '',
    isPublished: true,
    isPublic: false,
  }
  selectedTagIds.value = []
  errors.value = {}
}

function validateForm(): boolean {
  errors.value = {}

  if (!formData.value.title.trim()) {
    errors.value.title = 'Tytuł jest wymagany'
  } else if (formData.value.title.length < 3) {
    errors.value.title = 'Tytuł musi mieć minimum 3 znaki'
  } else if (formData.value.title.length > 120) {
    errors.value.title = 'Tytuł może mieć maksymalnie 120 znaków'
  }

  if (!formData.value.summary.trim()) {
    errors.value.summary = 'Krótki opis jest wymagany'
  } else if (formData.value.summary.length < 10) {
    errors.value.summary = 'Krótki opis musi mieć minimum 10 znaków'
  } else if (formData.value.summary.length > 300) {
    errors.value.summary = 'Krótki opis może mieć maksymalnie 300 znaków'
  }

  if (!formData.value.descriptionMarkdown.trim()) {
    errors.value.descriptionMarkdown = 'Pełny opis jest wymagany'
  } else if (formData.value.descriptionMarkdown.length < 10) {
    errors.value.descriptionMarkdown = 'Pełny opis musi mieć minimum 10 znaków'
  }

  if (!formData.value.imagePath.trim()) {
    errors.value.imagePath = 'Ścieżka do obrazu jest wymagana'
  }

  return Object.keys(errors.value).length === 0
}

function handleSubmit() {
  if (!validateForm()) return

  const data = {
    title: formData.value.title.trim(),
    summary: formData.value.summary.trim(),
    descriptionMarkdown: formData.value.descriptionMarkdown.trim(),
    imagePath: formData.value.imagePath.trim(),
    isPublished: formData.value.isPublished,
    isPublic: formData.value.isPublic,
  }

  emit('save', data, selectedTagIds.value)
}

function handleCancel() {
  emit('cancel')
}

function toggleTag(tagId: string) {
  const index = selectedTagIds.value.indexOf(tagId)
  if (index > -1) {
    selectedTagIds.value.splice(index, 1)
  } else {
    selectedTagIds.value.push(tagId)
  }
}

const titleLength = computed(() => formData.value.title.length)
const summaryLength = computed(() => formData.value.summary.length)
const descriptionLength = computed(() => formData.value.descriptionMarkdown.length)
</script>

<template>
  <div class="space-y-6">
    <h2 class="text-2xl font-bold text-gray-900">
      {{ course ? 'Edytuj kurs' : 'Dodaj nowy kurs' }}
    </h2>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Tytuł -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Tytuł kursu *
          <span class="text-xs text-gray-500 font-normal ml-2">
            ({{ titleLength }}/120)
          </span>
        </label>
        <input
          v-model="formData.title"
          type="text"
          placeholder="np. Vue 3 Masterclass"
          class="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          :class="errors.title ? 'border-red-500' : 'border-gray-300'"
          maxlength="120"
        />
        <p v-if="errors.title" class="mt-1 text-sm text-red-600">
          {{ errors.title }}
        </p>
      </div>

      <!-- Krótki opis -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Krótki opis *
          <span class="text-xs text-gray-500 font-normal ml-2">
            ({{ summaryLength }}/300)
          </span>
        </label>
        <textarea
          v-model="formData.summary"
          rows="3"
          placeholder="Krótki opis kursu wyświetlany na liście kursów..."
          class="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          :class="errors.summary ? 'border-red-500' : 'border-gray-300'"
          maxlength="300"
        />
        <p v-if="errors.summary" class="mt-1 text-sm text-red-600">
          {{ errors.summary }}
        </p>
      </div>

      <!-- Pełny opis (Markdown) -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Pełny opis (Markdown) *
          <span class="text-xs text-gray-500 font-normal ml-2">
            ({{ descriptionLength }} znaków)
          </span>
        </label>
        <textarea
          v-model="formData.descriptionMarkdown"
          rows="8"
          placeholder="Pełny opis kursu w formacie Markdown...&#10;&#10;## Nagłówek&#10;**Pogrubienie**&#10;- Lista"
          class="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
          :class="errors.descriptionMarkdown ? 'border-red-500' : 'border-gray-300'"
        />
        <p v-if="errors.descriptionMarkdown" class="mt-1 text-sm text-red-600">
          {{ errors.descriptionMarkdown }}
        </p>
        <p class="mt-1 text-xs text-gray-500">
          Wspiera formatowanie Markdown (nagłówki, listy, pogrubienie, itp.)
        </p>
      </div>

      <!-- Ścieżka do obrazu -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Ścieżka do obrazu *
        </label>
        <input
          v-model="formData.imagePath"
          type="text"
          placeholder="/images/course.jpg lub https://..."
          class="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          :class="errors.imagePath ? 'border-red-500' : 'border-gray-300'"
        />
        <p v-if="errors.imagePath" class="mt-1 text-sm text-red-600">
          {{ errors.imagePath }}
        </p>
        <p class="mt-1 text-xs text-gray-500">
          Ścieżka względna lub pełny URL do obrazu
        </p>
      </div>

      <!-- Preview obrazu -->
      <div v-if="formData.imagePath" class="border rounded-lg p-4 bg-gray-50">
        <p class="text-sm font-medium text-gray-700 mb-2">Podgląd:</p>
        <img
          :src="formData.imagePath"
          :alt="formData.title"
          class="w-full max-w-md h-48 object-cover rounded-lg"
          @error="() => {}"
        />
      </div>

      <!-- Tagi -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Tagi (opcjonalne)
        </label>
        <div v-if="allTags.length === 0" class="text-sm text-gray-500">
          Brak dostępnych tagów. Dodaj tagi w sekcji "Zarządzanie tagami".
        </div>
        <div v-else class="flex flex-wrap gap-2">
          <button
            v-for="tag in allTags"
            :key="tag.id"
            type="button"
            @click="toggleTag(tag.id)"
            class="px-3 py-1 rounded-full text-sm font-medium transition-colors"
            :class="selectedTagIds.includes(tag.id)
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'"
          >
            {{ tag.name }}
          </button>
        </div>
      </div>

      <!-- Checkboxy -->
      <div class="space-y-3">
        <label class="flex items-center gap-3 cursor-pointer">
          <input
            v-model="formData.isPublished"
            type="checkbox"
            class="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
          />
          <div>
            <span class="text-sm font-medium text-gray-900">Opublikowany</span>
            <p class="text-xs text-gray-500">
              Kurs będzie widoczny na liście kursów
            </p>
          </div>
        </label>

        <label class="flex items-center gap-3 cursor-pointer">
          <input
            v-model="formData.isPublic"
            type="checkbox"
            class="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
          />
          <div>
            <span class="text-sm font-medium text-gray-900">Publiczny</span>
            <p class="text-xs text-gray-500">
              Użytkownicy mogą dołączyć do kursu samodzielnie
            </p>
          </div>
        </label>
      </div>

      <!-- Przyciski -->
      <div class="flex justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          @click="handleCancel"
          class="px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          :disabled="isLoading"
        >
          Anuluj
        </button>
        <button
          type="submit"
          class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="isLoading"
        >
          <span v-if="isLoading">Zapisywanie...</span>
          <span v-else>{{ course ? 'Zapisz zmiany' : 'Utwórz kurs' }}</span>
        </button>
      </div>
    </form>
  </div>
</template>

