<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import MaxWidthWrapper from '@/components/wrappers/MaxWidthWrapper.vue'
import AdminNav from '@/components/admin/AdminNav.vue'
import ConfirmModal from '@/components/ui/ConfirmModal.vue'
import Action from '@/components/ui/Action.vue'
import type { Tag } from '@/types/Admin'
import { getTags, deleteTag } from '@/services/adminService'

const router = useRouter()

const tags = ref<Tag[]>([])
const searchQuery = ref('')
const isLoading = ref(false)
const error = ref<string | null>(null)
const isDeleteModalOpen = ref(false)
const tagToDelete = ref<Tag | null>(null)
const isDeleting = ref(false)

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

function handleEditTag(tag?: Tag) {
  if (tag) {
    router.push(`/admin/tags/${tag.id}`)
  } else {
    router.push('/admin/tags/new')
  }
}

function handleDeleteTag(tag: Tag) {
  tagToDelete.value = tag
  isDeleteModalOpen.value = true
}

async function confirmDeleteTag() {
  if (!tagToDelete.value) return

  isDeleting.value = true
  error.value = null

  try {
    await deleteTag(tagToDelete.value.id)
    await fetchTags()
    isDeleteModalOpen.value = false
    tagToDelete.value = null
  } catch (err: any) {
    error.value = err.message || 'Nie udało się usunąć tagu'
    console.error('Error deleting tag:', err)
  } finally {
    isDeleting.value = false
  }
}

function cancelDeleteTag() {
  isDeleteModalOpen.value = false
  tagToDelete.value = null
}

const deleteModalMessage = computed(() => {
  if (!tagToDelete.value) return ''

  if (tagToDelete.value.coursesCount && tagToDelete.value.coursesCount > 0) {
    return `Tag "${tagToDelete.value.name}" jest używany w ${tagToDelete.value.coursesCount} ${tagToDelete.value.coursesCount === 1 ? 'kursie' : 'kursach'}. Czy na pewno chcesz go usunąć? Ta operacja jest nieodwracalna.`
  }

  return `Czy na pewno chcesz usunąć tag "${tagToDelete.value.name}"? Ta operacja jest nieodwracalna.`
})

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
          <Action
            @click="handleEditTag()"
            variant="primary"
            size="lg"
            aria-label="Dodaj nowy tag"
          >
            <span class="text-xl">+</span>
            Dodaj tag
          </Action>
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
                    <Action
                      @click="handleEditTag(tag)"
                      variant="primary"
                      size="sm"
                      aria-label="Edytuj tag"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edytuj
                    </Action>
                    <Action
                      @click="handleDeleteTag(tag)"
                      variant="danger"
                      size="sm"
                      aria-label="Usuń tag"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Usuń
                    </Action>
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

    <ConfirmModal
      :is-open="isDeleteModalOpen"
      title="Usuń tag"
      :message="deleteModalMessage"
      confirm-text="Usuń"
      cancel-text="Anuluj"
      variant="danger"
      :is-loading="isDeleting"
      @confirm="confirmDeleteTag"
      @cancel="cancelDeleteTag"
      @update:is-open="cancelDeleteTag"
    />
  </div>
</template>


