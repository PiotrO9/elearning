<script setup lang="ts">
import { ref, computed } from 'vue'
import MaxWidthWrapper from '@/components/wrappers/MaxWidthWrapper.vue'
import AdminNav from '@/components/admin/AdminNav.vue'
import AdminTableHeader from '@/components/admin/table/AdminTableHeader.vue'
import { useHead } from '@vueuse/head'

interface LoginBanner {
    id: number
    position: number
    title: string
    description: string
    imageUrl: string
    isActive: boolean
}

const MAX_BANNERS = 4

// Placeholder dane - pozniej bedzie z API
const banners = ref<LoginBanner[]>([
    {
        id: 1,
        position: 1,
        title: 'Witaj w E-Learning!',
        description: 'Rozpocznij swoją przygodę z nauką online',
        imageUrl: 'https://picsum.photos/seed/banner1/1200/600',
        isActive: true,
    },
    {
        id: 2,
        position: 2,
        title: 'Tysiące kursów czeka',
        description: 'Odkryj kursy dostosowane do Twoich potrzeb',
        imageUrl: 'https://picsum.photos/seed/banner2/1200/600',
        isActive: true,
    },
    {
        id: 3,
        position: 3,
        title: 'Ucz się w swoim tempie',
        description: 'Dostęp 24/7 do materiałów edukacyjnych',
        imageUrl: 'https://picsum.photos/seed/banner3/1200/600',
        isActive: true,
    },
])

const selectedBanner = ref<LoginBanner | null>(null)
const isEditModalOpen = ref(false)
const isAddModalOpen = ref(false)

const canAddMore = computed(() => banners.value.length < MAX_BANNERS)

// Form data
const editForm = ref({
    title: '',
    description: '',
    imageUrl: '',
    isActive: true,
    position: 1,
})

function openEditModal(banner: LoginBanner) {
    selectedBanner.value = banner
    editForm.value = {
        title: banner.title,
        description: banner.description,
        imageUrl: banner.imageUrl,
        isActive: banner.isActive,
        position: banner.position,
    }
    isEditModalOpen.value = true
}

function openAddModal() {
    const nextPosition = banners.value.length + 1
    editForm.value = {
        title: '',
        description: '',
        imageUrl: '',
        isActive: true,
        position: nextPosition,
    }
    isAddModalOpen.value = true
}

function closeEditModal() {
    isEditModalOpen.value = false
    selectedBanner.value = null
    resetForm()
}

function closeAddModal() {
    isAddModalOpen.value = false
    resetForm()
}

function resetForm() {
    editForm.value = {
        title: '',
        description: '',
        imageUrl: '',
        isActive: true,
        position: 1,
    }
}

function handleSave() {
    if (!selectedBanner.value) return

    const index = banners.value.findIndex((b) => b.id === selectedBanner.value!.id)
    if (index !== -1) {
        const oldPosition = banners.value[index].position
        const newPosition = editForm.value.position

        // Aktualizuj banner
        banners.value[index] = {
            ...banners.value[index],
            title: editForm.value.title,
            description: editForm.value.description,
            imageUrl: editForm.value.imageUrl,
            isActive: editForm.value.isActive,
            position: newPosition,
        }

        // Jeśli zmieniono pozycję, przeorganizuj inne bannery
        if (oldPosition !== newPosition) {
            reorganizePositions(selectedBanner.value.id, oldPosition, newPosition)
        }

        sortBannersByPosition()
    }

    console.log('Zapisywanie bannera:', {
        id: selectedBanner.value.id,
        ...editForm.value,
    })

    closeEditModal()
}

function handleAdd() {
    const newId = Math.max(...banners.value.map((b) => b.id), 0) + 1
    const newBanner: LoginBanner = {
        id: newId,
        position: editForm.value.position,
        title: editForm.value.title,
        description: editForm.value.description,
        imageUrl: editForm.value.imageUrl,
        isActive: editForm.value.isActive,
    }

    // Przesuń inne bannery jeśli potrzeba
    banners.value.forEach((banner) => {
        if (banner.position >= editForm.value.position) {
            banner.position++
        }
    })

    banners.value.push(newBanner)
    sortBannersByPosition()

    console.log('Dodawanie nowego bannera:', newBanner)

    closeAddModal()
}

function handleDelete(banner: LoginBanner) {
    const confirmDelete = confirm(`Czy na pewno chcesz usunąć banner "${banner.title}"?`)
    if (!confirmDelete) return

    const index = banners.value.findIndex((b) => b.id === banner.id)
    if (index !== -1) {
        const deletedPosition = banners.value[index].position
        banners.value.splice(index, 1)

        // Przeorganizuj pozycje po usunięciu
        banners.value.forEach((b) => {
            if (b.position > deletedPosition) {
                b.position--
            }
        })

        sortBannersByPosition()

        console.log('Usuwanie bannera:', banner.id)
    }
}

function reorganizePositions(bannerId: number, oldPos: number, newPos: number) {
    if (oldPos === newPos) return

    banners.value.forEach((banner) => {
        if (banner.id === bannerId) return

        if (oldPos < newPos) {
            // Przesuwanie w dół - bannery między old a new przesuwają się w górę
            if (banner.position > oldPos && banner.position <= newPos) {
                banner.position--
            }
        } else {
            // Przesuwanie w górę - bannery między new a old przesuwają się w dół
            if (banner.position >= newPos && banner.position < oldPos) {
                banner.position++
            }
        }
    })
}

function sortBannersByPosition() {
    banners.value.sort((a, b) => a.position - b.position)
}

function toggleBannerStatus(banner: LoginBanner) {
    const index = banners.value.findIndex((b) => b.id === banner.id)
    if (index !== -1) {
        banners.value[index].isActive = !banners.value[index].isActive
        console.log('Zmiana statusu bannera:', banner.id, banners.value[index].isActive)
    }
}

const availablePositions = computed(() => {
    return Array.from({ length: banners.value.length }, (_, i) => i + 1)
})

const availablePositionsForNew = computed(() => {
    return Array.from({ length: banners.value.length + 1 }, (_, i) => i + 1)
})

useHead({
    title: 'Banery logowania - Panel administracyjny',
})
</script>

<template>
    <div class="min-h-screen bg-gray-50">
        <AdminNav />

        <MaxWidthWrapper>
            <div class="py-8">
                <div class="flex items-center justify-between mb-8">
                    <AdminTableHeader
                        title="Banery logowania"
                        :description="`Zarządzaj banerami wyświetlanymi na stronie logowania (${banners.length}/${MAX_BANNERS})`"
                    />

                    <button
                        v-if="canAddMore"
                        @click="openAddModal"
                        class="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 font-medium"
                    >
                        <span class="text-xl">+</span>
                        <span>Dodaj banner</span>
                    </button>
                    <div
                        v-else
                        class="px-6 py-3 bg-gray-200 text-gray-500 rounded-lg font-medium cursor-not-allowed"
                    >
                        Maksymalna liczba banerów ({{ MAX_BANNERS }})
                    </div>
                </div>

                <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div class="p-6">
                        <div v-if="banners.length === 0" class="text-center py-12">
                            <p class="text-gray-500 text-lg mb-4">Brak banerów</p>
                            <button
                                @click="openAddModal"
                                class="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                            >
                                Dodaj pierwszy banner
                            </button>
                        </div>

                        <div v-else class="space-y-4">
                            <div
                                v-for="banner in banners"
                                :key="banner.id"
                                class="group relative border-2 border-gray-200 rounded-xl overflow-hidden transition-all hover:border-purple-300 hover:shadow-md"
                            >
                                <div class="flex items-center gap-6 p-4">
                                    <!-- Pozycja -->
                                    <div
                                        class="flex items-center justify-center px-4 py-2 bg-purple-100 rounded-lg min-w-[60px]"
                                    >
                                        <span class="text-2xl font-bold text-purple-700"
                                            >#{{ banner.position }}</span
                                        >
                                    </div>

                                    <!-- Miniatura -->
                                    <div
                                        class="flex-shrink-0 w-48 h-24 rounded-lg overflow-hidden cursor-pointer hover:opacity-75 transition-opacity"
                                        @click="openEditModal(banner)"
                                    >
                                        <img
                                            :src="banner.imageUrl"
                                            :alt="banner.title"
                                            class="w-full h-full object-cover"
                                        />
                                    </div>

                                    <!-- Treść -->
                                    <div class="flex-1 cursor-pointer" @click="openEditModal(banner)">
                                        <h3 class="text-lg font-bold text-gray-900 mb-1">
                                            {{ banner.title }}
                                        </h3>
                                        <p class="text-sm text-gray-600">{{ banner.description }}</p>
                                    </div>

                                    <!-- Status -->
                                    <div class="flex items-center gap-3">
                                        <button
                                            @click="toggleBannerStatus(banner)"
                                            :class="[
                                                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                                                banner.isActive ? 'bg-green-500' : 'bg-gray-300',
                                            ]"
                                            :aria-label="`${banner.isActive ? 'Dezaktywuj' : 'Aktywuj'} banner`"
                                        >
                                            <span
                                                :class="[
                                                    'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                                                    banner.isActive
                                                        ? 'translate-x-6'
                                                        : 'translate-x-1',
                                                ]"
                                            />
                                        </button>
                                        <span
                                            :class="[
                                                'text-sm font-medium',
                                                banner.isActive ? 'text-green-600' : 'text-gray-500',
                                            ]"
                                        >
                                            {{ banner.isActive ? 'Aktywny' : 'Nieaktywny' }}
                                        </span>
                                    </div>

                                    <!-- Akcje -->
                                    <div class="flex items-center gap-2">
                                        <button
                                            @click="openEditModal(banner)"
                                            class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                        >
                                            Edytuj
                                        </button>
                                        <button
                                            @click="handleDelete(banner)"
                                            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                        >
                                            Usuń
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MaxWidthWrapper>

        <!-- Modal edycji -->
        <Teleport to="body">
            <div
                v-if="isEditModalOpen"
                class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
                @click.self="closeEditModal"
            >
                <div
                    class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                >
                    <div class="p-6 border-b border-gray-200">
                        <div class="flex items-center justify-between">
                            <h2 class="text-2xl font-bold text-gray-900">
                                Edytuj banner #{{ selectedBanner?.position }}
                            </h2>
                            <button
                                @click="closeEditModal"
                                class="p-2 hover:bg-gray-100 rounded-lg transition-colors text-2xl"
                                aria-label="Zamknij"
                            >
                                ×
                            </button>
                        </div>
                    </div>

                    <div class="p-6 space-y-6">
                        <!-- Podgląd -->
                        <div class="rounded-xl overflow-hidden border-2 border-gray-200">
                            <img
                                :src="editForm.imageUrl"
                                :alt="editForm.title"
                                class="w-full h-64 object-cover"
                            />
                        </div>

                        <!-- Formularz -->
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    Pozycja
                                </label>
                                <select
                                    v-model.number="editForm.position"
                                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                    <option
                                        v-for="pos in availablePositions"
                                        :key="pos"
                                        :value="pos"
                                    >
                                        Pozycja {{ pos }}
                                    </option>
                                </select>
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    Tytuł
                                </label>
                                <input
                                    v-model="editForm.title"
                                    type="text"
                                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="Wprowadź tytuł bannera"
                                />
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    Opis
                                </label>
                                <textarea
                                    v-model="editForm.description"
                                    rows="3"
                                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="Wprowadź opis bannera"
                                />
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    URL obrazka
                                </label>
                                <input
                                    v-model="editForm.imageUrl"
                                    type="text"
                                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="https://example.com/image.jpg"
                                />
                            </div>

                            <div class="flex items-center gap-3">
                                <button
                                    @click="editForm.isActive = !editForm.isActive"
                                    :class="[
                                        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                                        editForm.isActive ? 'bg-green-500' : 'bg-gray-300',
                                    ]"
                                >
                                    <span
                                        :class="[
                                            'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                                            editForm.isActive ? 'translate-x-6' : 'translate-x-1',
                                        ]"
                                    />
                                </button>
                                <label class="text-sm font-medium text-gray-700">
                                    Banner aktywny
                                </label>
                            </div>
                        </div>
                    </div>

                    <div class="p-6 border-t border-gray-200 flex justify-end gap-3">
                        <button
                            @click="closeEditModal"
                            class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Anuluj
                        </button>
                        <button
                            @click="handleSave"
                            class="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                            Zapisz zmiany
                        </button>
                    </div>
                </div>
            </div>
        </Teleport>

        <!-- Modal dodawania -->
        <Teleport to="body">
            <div
                v-if="isAddModalOpen"
                class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
                @click.self="closeAddModal"
            >
                <div
                    class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                >
                    <div class="p-6 border-b border-gray-200">
                        <div class="flex items-center justify-between">
                            <h2 class="text-2xl font-bold text-gray-900">Dodaj nowy banner</h2>
                            <button
                                @click="closeAddModal"
                                class="p-2 hover:bg-gray-100 rounded-lg transition-colors text-2xl"
                                aria-label="Zamknij"
                            >
                                ×
                            </button>
                        </div>
                    </div>

                    <div class="p-6 space-y-6">
                        <!-- Podgląd -->
                        <div
                            v-if="editForm.imageUrl"
                            class="rounded-xl overflow-hidden border-2 border-gray-200"
                        >
                            <img
                                :src="editForm.imageUrl"
                                :alt="editForm.title"
                                class="w-full h-64 object-cover"
                            />
                        </div>

                        <!-- Formularz -->
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    Pozycja
                                </label>
                                <select
                                    v-model.number="editForm.position"
                                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                    <option
                                        v-for="pos in availablePositionsForNew"
                                        :key="pos"
                                        :value="pos"
                                    >
                                        Pozycja {{ pos }}
                                    </option>
                                </select>
                                <p class="mt-1 text-xs text-gray-500">
                                    Wybierz pozycję, na której ma się pojawić banner (inne przesunie się
                                    automatycznie)
                                </p>
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    Tytuł
                                </label>
                                <input
                                    v-model="editForm.title"
                                    type="text"
                                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="Wprowadź tytuł bannera"
                                />
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    Opis
                                </label>
                                <textarea
                                    v-model="editForm.description"
                                    rows="3"
                                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="Wprowadź opis bannera"
                                />
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    URL obrazka
                                </label>
                                <input
                                    v-model="editForm.imageUrl"
                                    type="text"
                                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="https://example.com/image.jpg"
                                />
                            </div>

                            <div class="flex items-center gap-3">
                                <button
                                    @click="editForm.isActive = !editForm.isActive"
                                    :class="[
                                        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                                        editForm.isActive ? 'bg-green-500' : 'bg-gray-300',
                                    ]"
                                >
                                    <span
                                        :class="[
                                            'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                                            editForm.isActive ? 'translate-x-6' : 'translate-x-1',
                                        ]"
                                    />
                                </button>
                                <label class="text-sm font-medium text-gray-700">
                                    Banner aktywny
                                </label>
                            </div>
                        </div>
                    </div>

                    <div class="p-6 border-t border-gray-200 flex justify-end gap-3">
                        <button
                            @click="closeAddModal"
                            class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Anuluj
                        </button>
                        <button
                            @click="handleAdd"
                            class="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                            Dodaj banner
                        </button>
                    </div>
                </div>
            </div>
        </Teleport>
    </div>
</template>
