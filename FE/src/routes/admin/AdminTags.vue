<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import MaxWidthWrapper from '@/components/wrappers/MaxWidthWrapper.vue'
import AdminNav from '@/components/admin/AdminNav.vue'
import AdminTableHeader from '@/components/admin/table/AdminTableHeader.vue'
import AdminTableSearch from '@/components/admin/table/AdminTableSearch.vue'
import AdminTableLoading from '@/components/admin/table/AdminTableLoading.vue'
import AdminTable from '@/components/admin/table/AdminTable.vue'
import AdminTableRow from '@/components/admin/table/AdminTableRow.vue'
import Action from '@/components/ui/Action.vue'
import ConfirmModal from '@/components/ui/ConfirmModal.vue'
import Pagination from '@/components/ui/Pagination.vue'
import Icon from '@/components/ui/Icon.vue'
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
const currentPage = ref(1)
const limit = ref(10)
const totalTags = ref(0)

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
    } catch (err: unknown) {
        const errorMessage = err && typeof err === 'object' && 'message' in err
            ? String((err as { message: unknown }).message)
            : 'Nie udało się pobrać tagów'
        error.value = errorMessage
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
    } catch (err: unknown) {
        const errorMessage = err && typeof err === 'object' && 'message' in err
            ? String((err as { message: unknown }).message)
            : 'Nie udało się usunąć tagu'
        error.value = errorMessage
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
    <MaxWidthWrapper class="py-8 flex flex-col gap-4">
        <div>
            <AdminTableHeader
                title="Zarządzanie tagami"
                description="Dodawaj, edytuj i usuwaj tagi kursów"
                add-button-text="Dodaj tag"
                add-button-aria-label="Dodaj nowy tag"
                @add="handleEditTag()"
            />

            <div v-if="error" class="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
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
            :is-empty="tags.length === 0"
            empty-message="Nie znaleziono tagów"
        >
            <template #rows>
                <AdminTableRow
                    v-for="tag in tags"
                    :key="tag.id"
                    :item="tag"
                >
                    <template #default="{ item }">
                        <td class="px-6 py-4">
                            <div class="flex items-center gap-2">
                                <Icon
                                    name="tags"
                                    class="w-4 h-4 text-blue-500 flex-shrink-0"
                                />
                                <span class="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-700 group-hover:bg-blue-200 transition-colors">
                                    {{ item.name }}
                                </span>
                            </div>
                        </td>
                        <td class="px-6 py-4">
                            <div class="flex items-center gap-2 text-sm text-gray-700">
                                <Icon
                                    name="books"
                                    class="w-4 h-4 text-gray-400"
                                />
                                <span class="font-medium">{{ item.coursesCount || 0 }}</span>
                                <span class="text-gray-500">{{ item.coursesCount === 1 ? 'kurs' : 'kursów' }}</span>
                            </div>
                        </td>
                        <td class="px-6 py-4">
                            <div class="flex items-center gap-2 text-sm text-gray-600">
                                <Icon
                                    name="calendar"
                                    class="w-4 h-4 text-gray-400"
                                />
                                <span>{{ item.createdAt || '—' }}</span>
                            </div>
                        </td>
                        <td class="px-6 py-4">
                            <div class="flex items-center justify-end gap-1.5">
                                <Action
                                    @click="handleEditTag(item)"
                                    variant="primary"
                                    size="sm"
                                    circle
                                    aria-label="Edytuj tag"
                                >
                                    <Icon
                                        name="edit"
                                        class="w-4 h-4"
                                    />
                                </Action>
                                <Action
                                    @click="handleDeleteTag(item)"
                                    variant="danger"
                                    size="sm"
                                    circle
                                    aria-label="Usuń tag"
                                >
                                    <Icon
                                        name="delete"
                                        class="w-4 h-4"
                                    />
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


