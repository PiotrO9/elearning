<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import MaxWidthWrapper from '@/components/wrappers/MaxWidthWrapper.vue'
import AdminNav from '@/components/admin/AdminNav.vue'
import AdminTableHeader from '@/components/admin/AdminTableHeader.vue'
import AdminTableSearch from '@/components/admin/AdminTableSearch.vue'
import AdminTableLoading from '@/components/admin/AdminTableLoading.vue'
import AdminTable from '@/components/admin/AdminTable.vue'
import AdminTableRow from '@/components/admin/AdminTableRow.vue'
import Action from '@/components/ui/Action.vue'
import ConfirmModal from '@/components/ui/ConfirmModal.vue'
import Pagination from '@/components/ui/Pagination.vue'
import type { Tag } from '@/types/Admin'
import { getTags, deleteTag } from '@/services/adminService'

const tableColumns = [
  { label: 'Nazwa tagu', align: 'left' as const },
  { label: 'Liczba kursów', align: 'left' as const },
  { label: 'Data utworzenia', align: 'left' as const },
  { label: 'Akcje', align: 'right' as const }
]

const router = useRouter()

const tags = ref<Tag[]>([])
const searchQuery = ref('')
const isLoading = ref(false)
const error = ref<string | null>(null)
const isDeleteModalOpen = ref(false)
const tagToDelete = ref<Tag | null>(null)
const isDeleting = ref(false)

// Paginacja
const currentPage = ref(1)
const limit = ref(10)
const totalTags = ref(0)

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
    const response = await getTags({
      page: currentPage.value,
      limit: limit.value
    })
    tags.value = response.data.items
    totalTags.value = response.data.total
  } catch (err: any) {
    error.value = err.message || 'Nie udało się pobrać tagów'
    console.error('Error fetching tags:', err)
  } finally {
    isLoading.value = false
  }
}

function handlePageChange(page: number) {
  currentPage.value = page
  fetchTags()
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
        <AdminTableHeader
          title="Zarządzanie tagami"
          description="Dodawaj, edytuj i usuwaj tagi kursów"
          add-button-text="Dodaj tag"
          add-button-aria-label="Dodaj nowy tag"
          @add="handleEditTag()"
        />

        <div v-if="error" class="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {{ error }}
        </div>

        <AdminTableSearch
          v-model="searchQuery"
          placeholder="Szukaj tagu..."
          :disabled="isLoading"
        />
      </div>

      <AdminTableLoading v-if="isLoading" message="Ładowanie tagów..." />

      <AdminTable
        v-else
        :columns="tableColumns"
        :is-empty="filteredTags.length === 0"
        empty-message="Nie znaleziono tagów"
      >
        <template #rows>
          <AdminTableRow
            v-for="tag in filteredTags"
            :key="tag.id"
            :item="tag"
          >
            <template #default="{ item: tag }">
              <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <span class="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-700 group-hover:bg-blue-200 transition-colors">
                    {{ tag.name }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-2 text-sm text-gray-700">
                  <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span class="font-medium">{{ tag.coursesCount || 0 }}</span>
                  <span class="text-gray-500">{{ tag.coursesCount === 1 ? 'kurs' : 'kursów' }}</span>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-2 text-sm text-gray-600">
                  <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{{ tag.createdAt }}</span>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center justify-end gap-1.5">
                  <Action
                    @click="handleEditTag(tag)"
                    variant="primary"
                    size="sm"
                    aria-label="Edytuj tag"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span class="hidden sm:inline">Edytuj</span>
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
                    <span class="hidden sm:inline">Usuń</span>
                  </Action>
                </div>
              </td>
            </template>
          </AdminTableRow>
        </template>
      </AdminTable>

      <Pagination
        v-if="!isLoading && totalTags > 0"
        :current-page="currentPage"
        :total-items="totalTags"
        :items-per-page="limit"
        @page-change="handlePageChange"
      />
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


