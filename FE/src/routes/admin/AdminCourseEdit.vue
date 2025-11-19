<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import MaxWidthWrapper from '@/components/wrappers/MaxWidthWrapper.vue'
import AdminNav from '@/components/admin/AdminNav.vue'
import CourseForm from '@/components/admin/CourseForm.vue'
import type { CourseListItem } from '@/types/Course'
import type { Tag, CreateCourseInput, UpdateCourseInput } from '@/types/Admin'
import { getCourses } from '@/services/courseService'
import { updateCourse, createCourse, getTags, assignTagsToCourse } from '@/services/adminService'

const router = useRouter()
const route = useRoute()

const course = ref<CourseListItem | null>(null)
const tags = ref<Tag[]>([])
const isSaving = ref(false)
const isLoading = ref(false)
const error = ref<string | null>(null)

const courseId = route.params.id as string
const isEditMode = !!courseId && courseId !== 'new'

async function fetchCourse() {
    if (!isEditMode) return

    isLoading.value = true
    error.value = null

    try {
        const response = await getCourses()
        const foundCourse = response.courses.find(c => c.id.toString() === courseId)

        if (!foundCourse) {
            error.value = 'Kurs nie został znaleziony'
            return
        }

        course.value = foundCourse
    } catch (err: any) {
        error.value = err.message || 'Nie udało się pobrać kursu'
        console.error('Error fetching course:', err)
    } finally {
        isLoading.value = false
    }
}

async function fetchTags() {
    try {
        tags.value = await getTags()
    } catch (err: any) {
        console.error('Error fetching tags:', err)
    }
}

async function handleSaveCourse(data: CreateCourseInput | UpdateCourseInput, tagIds: string[]) {
    isSaving.value = true
    error.value = null

    try {
        let savedCourseId: string

        if (isEditMode && course.value) {
            // Edycja
            savedCourseId = course.value.id.toString()
            await updateCourse(savedCourseId, data as UpdateCourseInput)
        } else {
            // Tworzenie
            const response = await createCourse(data as CreateCourseInput)
            savedCourseId = response.data?.id || ''
        }

        // Przypisz tagi do kursu (jeśli są wybrane)
        if (savedCourseId && tagIds.length > 0) {
            try {
                await assignTagsToCourse(savedCourseId, tagIds)
            } catch (err) {
                console.error('Error assigning tags:', err)
                // Nie przerywamy procesu jeśli przypisanie tagów się nie powiodło
            }
        }

        // Przekieruj do listy kursów po zapisaniu
        router.push('/admin/courses')
    } catch (err: any) {
        error.value = err.response?.data?.message || err.message || 'Nieznany błąd'
        console.error('Error saving course:', err)
    } finally {
        isSaving.value = false
    }
}

function handleCancel() {
    router.push('/admin/courses')
}

onMounted(() => {
    fetchCourse()
    fetchTags()
})
</script>

<template>
<div class="min-h-screen bg-gray-50">
    <AdminNav />
    <MaxWidthWrapper class="py-8">
        <div v-if="error" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {{ error }}
        </div>

        <div v-if="isLoading" class="text-center py-12">
            <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"></div>
            <p class="mt-4 text-gray-600">Ładowanie kursu...</p>
        </div>

        <CourseForm
            v-else
            :course="course"
            :all-tags="tags"
            :is-loading="isSaving"
            @save="handleSaveCourse"
            @cancel="handleCancel"
        />
    </MaxWidthWrapper>
</div>
</template>

