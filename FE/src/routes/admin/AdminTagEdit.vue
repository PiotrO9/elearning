<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import MaxWidthWrapper from '@/components/wrappers/MaxWidthWrapper.vue'
import AdminNav from '@/components/admin/AdminNav.vue'
import type { Tag } from '@/types/Admin'
import { getTags, createTag, updateTag } from '@/services/adminService'

const router = useRouter()
const route = useRoute()

const tagName = ref('')
const tagDescription = ref('')
const isSaving = ref(false)
const isLoading = ref(false)
const error = ref<string | null>(null)

const tagId = route.params.id as string
const isEditMode = !!tagId && tagId !== 'new'

async function fetchTag() {
  if (!isEditMode) return

  isLoading.value = true
  error.value = null

  try {
    const tags = await getTags()
    const foundTag = tags.find(t => t.id === tagId)

    if (!foundTag) {
      error.value = 'Tag nie został znaleziony'
      return
    }

    tagName.value = foundTag.name || ''
    tagDescription.value = foundTag.description || ''
  } catch (err: any) {
    error.value = err.message || 'Nie udało się pobrać tagu'
    console.error('Error fetching tag:', err)
  } finally {
    isLoading.value = false
  }
}

async function handleSaveTag() {
  if (!tagName.value.trim()) {
    error.value = 'Nazwa tagu jest wymagana'
    return
  }

  isSaving.value = true
  error.value = null

  try {
    if (isEditMode) {
      // Edycja
      await updateTag(tagId, {
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

    // Przekieruj do listy tagów po zapisaniu
    router.push('/admin/tags')
  } catch (err: any) {
    error.value = err.response?.data?.message || err.message || 'Nieznany błąd'
    console.error('Error saving tag:', err)
  } finally {
    isSaving.value = false
  }
}

function handleCancel() {
  router.push('/admin/tags')
}

onMounted(() => {
  fetchTag()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <AdminNav />
    <MaxWidthWrapper class="py-8">
      <div class="space-y-6">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">
            {{ isEditMode ? 'Edytuj tag' : 'Dodaj nowy tag' }}
          </h2>
        </div>

        <div v-if="error" class="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {{ error }}
        </div>

        <div v-if="isLoading" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"></div>
          <p class="mt-4 text-gray-600">Ładowanie tagu...</p>
        </div>

        <div v-else class="bg-white rounded-xl shadow-md p-6">
          <form @submit.prevent="handleSaveTag" class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Nazwa tagu *
              </label>
              <input
                v-model="tagName"
                type="text"
                placeholder="np. Vue, React, TypeScript"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                :disabled="isSaving"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Opis (opcjonalne)
              </label>
              <textarea
                v-model="tagDescription"
                rows="3"
                placeholder="Opis tagu..."
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                :disabled="isSaving"
              />
            </div>

            <div class="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                @click="handleCancel"
                class="px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                :disabled="isSaving"
              >
                Anuluj
              </button>
              <button
                type="submit"
                :disabled="!tagName.trim() || isSaving"
                class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span v-if="isSaving">Zapisywanie...</span>
                <span v-else>{{ isEditMode ? 'Aktualizuj' : 'Dodaj' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </MaxWidthWrapper>
  </div>
</template>

