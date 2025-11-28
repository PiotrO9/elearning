<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import MaxWidthWrapper from '@/components/wrappers/MaxWidthWrapper.vue'
import ConfirmModal from '@/components/ui/ConfirmModal.vue'
import AdminNav from '@/components/admin/AdminNav.vue'
import AdminTableHeader from '@/components/admin/table/AdminTableHeader.vue'
import AdminTableSearch from '@/components/admin/table/AdminTableSearch.vue'
import AdminTable from '@/components/admin/table/AdminTable.vue'
import AdminTableRow from '@/components/admin/table/AdminTableRow.vue'
import Action from '@/components/ui/Action.vue'
import Pagination from '@/components/ui/Pagination.vue'
import CopyableText from '@/components/ui/CopyableText.vue'
import Icon from '@/components/ui/Icon.vue'
import type { User, UserAdminPanelListItem } from '@/types/User'
import { getAllUsers, updateUserRole } from '@/services/adminService'

const router = useRouter()

const tableColumns = [
    { label: 'Użytkownik', align: 'left' as const },
    { label: 'Email', align: 'left' as const },
    { label: 'Rola', align: 'left' as const },
    { label: 'Przypisane kursy', align: 'left' as const },
    { label: 'Akcje', align: 'right' as const },
]

interface UserWithCourses extends User {
    enrolledCourses: string[]
    enrolledAt?: string
}

interface UserListItem extends UserAdminPanelListItem {
    enrolledCourses: string[]
}

const users = ref<UserListItem[]>([])

const isRoleChangeModalOpen = ref(false)
const isChangingRole = ref(false)
const searchQuery = ref('')
const userToChangeRole = ref<UserWithCourses | null>(null)
const isLoadingUsers = ref(false)
const error = ref<string | null>(null)
const roleChangeError = ref<string | null>(null)

// Paginacja
const currentPage = ref(1)
const limit = ref(10)
const totalUsers = ref(0)

// Timer dla debounce
let searchTimeout: ReturnType<typeof setTimeout> | null = null

async function fetchUsers() {
    isLoadingUsers.value = true
    error.value = null

    try {
        const response = await getAllUsers({
            page: currentPage.value,
            limit: limit.value,
            search: searchQuery.value.trim() || undefined,
        })

        if (response.data && response.success && response.data.items) {
            users.value = response.data.items.map(
                (user): UserListItem => ({
                    ...user,
                    enrolledCourses: [],
                }),
            )

            totalUsers.value = response.data.pagination.totalItems
        } else {
            error.value = 'Nie udało się pobrać użytkowników'
            users.value = []
            totalUsers.value = 0
        }
    } catch (err: unknown) {
        const errorMessage =
            err && typeof err === 'object' && 'response' in err
                ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
                : err && typeof err === 'object' && 'message' in err
                  ? String((err as { message: unknown }).message)
                  : 'Wystąpił błąd podczas pobierania użytkowników'
        error.value = errorMessage || 'Wystąpił błąd podczas pobierania użytkowników'
        console.error('Error fetching users:', err)
        users.value = []
        totalUsers.value = 0
    } finally {
        isLoadingUsers.value = false
    }
}

function handleManageCourses(user: UserWithCourses) {
    router.push(`/admin/users/${user.id}/courses`)
}

function handleToggleRole(user: UserWithCourses) {
    userToChangeRole.value = user
    isRoleChangeModalOpen.value = true
}

async function handleConfirmRoleChange() {
    if (!userToChangeRole.value) return

    isChangingRole.value = true
    roleChangeError.value = null

    try {
        const newRole = userToChangeRole.value.role === 'ADMIN' ? 'USER' : 'ADMIN'
        const response = await updateUserRole(userToChangeRole.value.id, newRole)

        if (response.success && response.data?.user) {
            // Aktualizuj rolę w liście użytkowników
            const index = users.value.findIndex((u) => u.id === userToChangeRole.value!.id)
            const userData = response.data?.user
            if (index !== -1 && userData && users.value[index]) {
                users.value[index].role = userData.role
            }
        }

        isRoleChangeModalOpen.value = false
        userToChangeRole.value = null
    } catch (err: unknown) {
        interface ErrorResponse {
            code?: string
            message?: string
        }

        const errorResponse: ErrorResponse | null =
            err && typeof err === 'object' && 'response' in err
                ? (err as { response?: { data?: ErrorResponse } }).response?.data || null
                : null

        if (errorResponse?.code === 'INSUFFICIENT_PERMISSIONS') {
            roleChangeError.value =
                'Brak uprawnień. Administrator może tylko awansować użytkowników z roli USER na ADMIN.'
        } else if (errorResponse?.code === 'SAME_ROLE') {
            roleChangeError.value = 'Użytkownik już ma tę rolę.'
        } else if (errorResponse?.code === 'USER_NOT_FOUND') {
            roleChangeError.value = 'Użytkownik nie został znaleziony.'
        } else {
            roleChangeError.value = errorResponse?.message || 'Wystąpił błąd podczas zmiany roli.'
        }
    } finally {
        isChangingRole.value = false
    }
}

function handleCancelRoleChange() {
    isRoleChangeModalOpen.value = false
    userToChangeRole.value = null
    roleChangeError.value = null
}

function handlePageChange(page: number) {
    currentPage.value = page
    fetchUsers()
}

// Watcher na zmianę wyszukiwania z debounce
watch(searchQuery, () => {
    currentPage.value = 1

    // Anuluj poprzedni timer, jeśli istnieje
    if (searchTimeout) {
        clearTimeout(searchTimeout)
    }

    // Ustaw nowy timer - wyślij zapytanie po 500ms od ostatniego wpisania
    searchTimeout = setTimeout(() => {
        fetchUsers()
    }, 500)
})

onMounted(() => {
    fetchUsers()
})

onUnmounted(() => {
    if (searchTimeout) {
        clearTimeout(searchTimeout)
    }
})
</script>

<template>
    <div class="min-h-screen bg-gray-50">
        <AdminNav />
        <MaxWidthWrapper class="py-8 flex flex-col gap-4">
            <div>
                <AdminTableHeader
                    title="Zarządzanie użytkownikami"
                    description="Przypisuj użytkowników do kursów i zarządzaj rolami"
                />

                <AdminTableSearch v-model="searchQuery" placeholder="Szukaj użytkownika..." />
            </div>

            <div v-if="error" class="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p class="text-sm text-red-700">{{ error }}</p>
            </div>

            <AdminTable
                :columns="tableColumns"
                :is-empty="!isLoadingUsers && users.length === 0"
                empty-message="Nie znaleziono użytkowników"
            >
                <template v-if="isLoadingUsers" #empty>
                    <div class="text-center py-12">
                        <div
                            class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"
                        ></div>
                        <p class="mt-4 text-gray-600">Ładowanie użytkowników...</p>
                    </div>
                </template>
                <template #rows>
                    <AdminTableRow v-for="user in users" :key="user.id" :item="user">
                        <template #default="{ item }">
                            <td class="px-6 py-4">
                                <div class="flex items-center gap-3">
                                    <div class="relative flex-shrink-0">
                                        <div
                                            class="w-11 h-11 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center shadow-sm ring-2 ring-white group-hover:ring-purple-200 transition-all"
                                        >
                                            <span class="text-white font-semibold text-sm">
                                                {{ item.username.charAt(0).toUpperCase() }}
                                            </span>
                                        </div>
                                        <div
                                            v-if="item.role === 'ADMIN'"
                                            class="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-yellow-400 rounded-full border-2 border-white flex items-center justify-center"
                                            title="Administrator"
                                        >
                                            <Icon name="star" class="w-2.5 h-2.5 text-yellow-900" />
                                        </div>
                                    </div>
                                    <div class="min-w-0 flex-1">
                                        <p
                                            class="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors truncate"
                                        >
                                            {{ item.username }}
                                        </p>
                                        <div class="mt-0.5">
                                            <CopyableText
                                                :text="item.id"
                                                label="ID:"
                                                :show-icon="true"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td class="px-6 py-4">
                                <div class="flex items-center gap-2 text-sm text-gray-700">
                                    <Icon
                                        name="email"
                                        class="w-4 h-4 text-gray-400 flex-shrink-0"
                                    />
                                    <CopyableText :text="item.email" :show-icon="true" />
                                </div>
                            </td>
                            <td class="px-6 py-4">
                                <button
                                    @click="handleToggleRole(item)"
                                    class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                                    tabindex="0"
                                    aria-label="Zmień rolę użytkownika"
                                    @keydown="(e) => e.key === 'Enter' && handleToggleRole(item)"
                                >
                                    <span
                                        class="px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5"
                                        :class="
                                            item.role === 'ADMIN'
                                                ? 'bg-purple-100 text-purple-700'
                                                : 'bg-gray-100 text-gray-700'
                                        "
                                    >
                                        <Icon
                                            v-if="item.role === 'ADMIN'"
                                            name="star"
                                            class="w-3.5 h-3.5"
                                        />
                                        <Icon v-else name="user" class="w-3.5 h-3.5" />
                                        {{ item.role === 'ADMIN' ? 'Admin' : 'Użytkownik' }}
                                    </span>
                                </button>
                            </td>
                            <td class="px-6 py-4">
                                <div class="inline-flex items-center gap-1.5 text-sm text-gray-600">
                                    <Icon name="books" class="w-4 h-4 text-gray-400" />
                                    <span v-if="item.coursesCount !== undefined">
                                        {{ item.coursesCount }}
                                        {{
                                            item.coursesCount === 1
                                                ? 'kurs'
                                                : item.coursesCount < 5
                                                  ? 'kursy'
                                                  : 'kursów'
                                        }}
                                    </span>
                                    <span v-else class="text-gray-400">—</span>
                                </div>
                            </td>
                            <td class="px-6 py-4">
                                <div class="flex items-center justify-end">
                                    <Action
                                        @click="handleManageCourses(item)"
                                        variant="outline"
                                        size="sm"
                                        circle
                                        aria-label="Zarządzaj kursami użytkownika"
                                    >
                                        <Icon name="settings" class="w-4 h-4" />
                                    </Action>
                                </div>
                            </td>
                        </template>
                    </AdminTableRow>
                </template>
            </AdminTable>

            <Pagination
                v-if="!isLoadingUsers && totalUsers > 0"
                :current-page="currentPage"
                :total-items="totalUsers"
                :items-per-page="limit"
                @page-change="handlePageChange"
            />
        </MaxWidthWrapper>

        <ConfirmModal
            :is-open="isRoleChangeModalOpen"
            title="Zmiana roli użytkownika"
            :message="
                userToChangeRole
                    ? `Czy na pewno chcesz zmienić rolę użytkownika ${userToChangeRole.username} z ${userToChangeRole.role === 'ADMIN' ? 'Administratora' : 'Użytkownika'} na ${userToChangeRole.role === 'ADMIN' ? 'Użytkownika' : 'Administratora'}?`
                    : ''
            "
            confirm-text="Tak, zmień rolę"
            cancel-text="Anuluj"
            variant="warning"
            :is-loading="isChangingRole"
            @confirm="handleConfirmRoleChange"
            @cancel="handleCancelRoleChange"
            @update:is-open="handleCancelRoleChange"
        >
            <div v-if="roleChangeError" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p class="text-sm text-red-700">{{ roleChangeError }}</p>
            </div>
        </ConfirmModal>
    </div>
</template>
