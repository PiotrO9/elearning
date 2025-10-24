<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import MaxWidthWrapper from '@/components/wrappers/MaxWidthWrapper.vue'
import Modal from '@/components/ui/Modal.vue'
import AdminNav from '@/components/admin/AdminNav.vue'
import type { Tag } from '@/types/Admin'
import { getTags, createTag, updateTag, deleteTag } from '@/services/adminService'

const tags = ref<Tag[]>([])
const isModalOpen = ref(false)
const searchQuery = ref('')
const selectedTag = ref<Tag | null>(null)
const tagName = ref('')
const tagDescription = ref('')
const isLoading = ref(false)
const error = ref<string | null>(null)

const filteredTags = computed(() => {
  if (!tags.value) return []
  if (!searchQuery.value) return tags.value

  return tags.value.filter(tag =>
    tag.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

async function fetchTags() {
  isLoading.value = true
  error.value = null

  try {
    tags.value = await getTags()
  } catch (err: any) {
    error.value = err.message || 'Nie udało się pobrać tagów'
    console.error('Error fetching tags:', err)
  } finally {
    isLoading.value = false
  }
}

function handleOpenModal(tag?: Tag) {
  selectedTag.value = tag || null
  tagName.value = tag?.name || ''
  tagDescription.value = tag?.description || ''
  isModalOpen.value = true
}

function handleCloseModal() {
  isModalOpen.value = false
  selectedTag.value = null
  tagName.value = ''
  tagDescription.value = ''
}

async function handleSaveTag() {
  if (!tagName.value.trim()) return

  try {
    if (selectedTag.value) {
      // Edycja
      await updateTag(selectedTag.value.id, {
        name: tagName.value,
        description: tagDescription.value || undefined
      })
    } else {
      // Dodawanie
      await createTag({
        name: tagName.value,
        description: tagDescription.value || undefined
      })
    }

    await fetchTags()
    handleCloseModal()
  } catch (err: any) {
    alert('Błąd podczas zapisywania tagu: ' + (err.message || 'Nieznany błąd'))
    console.error('Error saving tag:', err)
  }
}

async function handleDeleteTag(tagId: string) {
  const tag = tags.value.find(t => t.id === tagId)

  if (tag && tag.coursesCount && tag.coursesCount > 0) {
    if (!confirm(`Tag "${tag.name}" jest używany w ${tag.coursesCount} kursach. Czy na pewno chcesz go usunąć?`)) {
      return
    }
  }

  try {
    await deleteTag(tagId)
    await fetchTags()
  } catch (err: any) {
    alert('Błąd podczas usuwania tagu: ' + (err.message || 'Nieznany błąd'))
    console.error('Error deleting tag:', err)
  }
}

onMounted(() => {
  fetchTags()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <AdminNav />
    <MaxWidthWrapper class="py-8">
      <div class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h1 class="text-4xl font-bold text-gray-900 mb-2">
              Zarządzanie tagami
            </h1>
            <p class="text-lg text-gray-600">
              Dodawaj, edytuj i usuwaj tagi kursów
            </p>
          </div>
          <button
            @click="handleOpenModal()"
            class="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <span class="text-xl">+</span>
            Dodaj tag
          </button>
        </div>

        <div v-if="error" class="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {{ error }}
        </div>

        <input
          v-model="searchQuery"
          type="text"
          placeholder="Szukaj tagu..."
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          :disabled="isLoading"
        />
      </div>

      <div v-if="isLoading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"></div>
        <p class="mt-4 text-gray-600">Ładowanie tagów...</p>
      </div>

      <div v-else class="bg-white rounded-xl shadow-md overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Nazwa tagu</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Liczba kursów</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Data utworzenia</th>
                <th class="px-6 py-4 text-right text-sm font-semibold text-gray-900">Akcje</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr
                v-for="tag in filteredTags"
                :key="tag.id"
                class="hover:bg-gray-50 transition-colors"
              >
                <td class="px-6 py-4">
                  <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                    🏷️ {{ tag.name }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-700">
                  {{ tag.coursesCount }} {{ tag.coursesCount === 1 ? 'kurs' : 'kursów' }}
                </td>
                <td class="px-6 py-4 text-sm text-gray-700">
                  {{ tag.createdAt }}
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center justify-end gap-2">
                    <button
                      @click="handleOpenModal(tag)"
                      class="px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      Edytuj
                    </button>
                    <button
                      @click="handleDeleteTag(tag.id)"
                      class="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      Usuń
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div
          v-if="filteredTags.length === 0"
          class="text-center py-12"
        >
          <p class="text-gray-500">Nie znaleziono tagów</p>
        </div>
      </div>
    </MaxWidthWrapper>

    <Modal :is-open="isModalOpen" @update:is-open="handleCloseModal">
      <div class="p-6">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">
          {{ selectedTag ? 'Edytuj tag' : 'Dodaj nowy tag' }}
        </h2>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Nazwa tagu *
          </label>
          <input
            v-model="tagName"
            type="text"
            placeholder="np. Vue, React, TypeScript"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            @keyup.enter="handleSaveTag"
          />
        </div>

        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Opis (opcjonalne)
          </label>
          <textarea
            v-model="tagDescription"
            rows="3"
            placeholder="Opis tagu..."
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div class="flex justify-end gap-3">
          <button
            @click="handleCloseModal"
            class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Anuluj
          </button>
          <button
            @click="handleSaveTag"
            :disabled="!tagName.trim()"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ selectedTag ? 'Aktualizuj' : 'Dodaj' }}
          </button>
        </div>
      </div>
    </Modal>
  </div>
</template>

