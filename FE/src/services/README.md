# Serwisy API - Dokumentacja

## Course Service

Serwis do obsługi API kursów.

### Endpointy

- `GET /api/course` - Lista kursów (tylko opublikowane, `isPublished: true`)
- `GET /api/course/:id` - Szczegóły kursu
- `GET /api/course?tag=javascript` - Filtrowanie po tagu

### Importowanie

```typescript
import { getCourses, getCourseDetails, getCoursesByTag } from '@/services'
```

### Funkcje

#### `getCourses(params?: GetCoursesParams)`

Pobiera listę wszystkich opublikowanych kursów.

**Parametry:**
- `params.tag` (opcjonalny) - Filtrowanie po tagu

**Zwraca:**
```typescript
{
  courses: CourseListItem[],
  total: number
}
```

**Przykład:**
```typescript
// Wszystkie kursy
const { courses, total } = await getCourses()

// Kursy z tagiem
const { courses } = await getCourses({ tag: 'javascript' })
```

#### `getCourseDetails(id: number | string)`

Pobiera szczegóły pojedynczego kursu wraz z listą video.

**Parametry:**
- `id` - ID kursu

**Zwraca:**
```typescript
{
  course: CourseDetails
}
```

**Przykład:**
```typescript
const { course } = await getCourseDetails(1)
```

#### `getCoursesByTag(tag: string)`

Skrót do pobierania kursów z określonym tagiem.

**Parametry:**
- `tag` - Tag do filtrowania

**Przykład:**
```typescript
const { courses } = await getCoursesByTag('vue')
```

## Composable: useCourses

Composable z reaktywnym stanem i metodami do zarządzania kursami.

### Importowanie

```typescript
import { useCourses } from '@/composables/useCourses'
```

### Użycie w komponencie

```vue
<script setup lang="ts">
import { onMounted } from 'vue'
import { useCourses } from '@/composables/useCourses'
import { useAuthStore } from '@/stores/auth'
import { filterCourseVideos } from '@/utils/courseUtils'

const authStore = useAuthStore()
const { 
  courses, 
  currentCourse, 
  isLoading, 
  error,
  fetchCourses,
  fetchCourseDetails,
  fetchCoursesByTag,
  resetError
} = useCourses()

// Pobranie wszystkich kursów przy montowaniu
onMounted(async () => {
  await fetchCourses()
})

// Filtrowanie po tagu
async function handleFilterByTag(tag: string) {
  await fetchCoursesByTag(tag)
}

// Pobranie szczegółów kursu
async function handleCourseClick(id: number) {
  await fetchCourseDetails(id)
  
  // Filtrowanie video dla niezalogowanych użytkowników
  if (currentCourse.value) {
    currentCourse.value = filterCourseVideos(
      currentCourse.value, 
      authStore.isAuthenticated
    )
  }
}
</script>

<template>
  <div>
    <div v-if="isLoading">Ładowanie...</div>
    <div v-else-if="error">{{ error }}</div>
    <div v-else>
      <div v-for="course in courses" :key="course.id">
        {{ course.title }}
      </div>
    </div>
  </div>
</template>
```

### Reaktywne właściwości

- `courses` - Lista kursów (`CourseListItem[]`)
- `currentCourse` - Aktualnie wybrany kurs (`CourseDetails | null`)
- `isLoading` - Stan ładowania (`boolean`)
- `error` - Komunikat błędu (`string | null`)

### Metody

- `fetchCourses(tag?: string)` - Pobiera listę kursów
- `fetchCoursesByTag(tag: string)` - Pobiera kursy z określonym tagiem
- `fetchCourseDetails(id: number | string)` - Pobiera szczegóły kursu
- `resetCurrentCourse()` - Resetuje aktualny kurs
- `resetError()` - Resetuje błędy

## Typy

### CourseListItem

Kurs w liście kursów:

```typescript
interface CourseListItem {
  id: number
  title: string
  description: string
  instructor: string
  thumbnail: string
  tags: string[]
  isPublished: boolean
  createdAt: string
  updatedAt: string
}
```

### CourseDetails

Szczegóły kursu z listą video:

```typescript
interface CourseDetails extends Course {
  videos: Video[]
}
```

### Video

```typescript
interface Video {
  id: number
  title: string
  duration: string
  isCompleted?: boolean
  isFree?: boolean
  isTrailer?: boolean  // true dla video dostępnych dla niezalogowanych
  url?: string
  order?: number
}
```

## Filtrowanie video dla niezalogowanych użytkowników

Użytkownicy niezalogowani mogą widzieć tylko video z `isTrailer: true`.

### Funkcje pomocnicze

```typescript
import { filterCourseVideos, hasAccessToVideo } from '@/utils/courseUtils'
```

#### `filterCourseVideos(course: CourseDetails, isAuthenticated: boolean)`

Filtruje video w kursie dla niezalogowanych użytkowników.

**Przykład:**
```typescript
const filteredCourse = filterCourseVideos(course, authStore.isAuthenticated)
```

#### `hasAccessToVideo(video: Video, isAuthenticated: boolean)`

Sprawdza czy użytkownik ma dostęp do pojedynczego video.

**Przykład:**
```typescript
const canWatch = hasAccessToVideo(video, authStore.isAuthenticated)
```

## Obsługa błędów

Wszystkie funkcje API używają interceptora z `httpClient`, który automatycznie:
- Odświeża token przy błędzie 401
- Obsługuje kolejkę requestów podczas odświeżania tokena
- Zwraca błędy dla dalszej obsługi w komponencie

## Przykład pełnej implementacji

```vue
<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useCourses } from '@/composables/useCourses'
import { useAuthStore } from '@/stores/auth'
import { filterCourseVideos, hasAccessToVideo } from '@/utils/courseUtils'

const route = useRoute()
const authStore = useAuthStore()
const { 
  currentCourse, 
  isLoading, 
  error,
  fetchCourseDetails
} = useCourses()

const courseId = computed(() => route.params.id as string)

const filteredCourse = computed(() => {
  if (!currentCourse.value) return null
  return filterCourseVideos(currentCourse.value, authStore.isAuthenticated)
})

onMounted(async () => {
  await fetchCourseDetails(courseId.value)
})

function handleVideoClick(video: Video) {
  if (!hasAccessToVideo(video, authStore.isAuthenticated)) {
    // Pokazanie komunikatu o konieczności zalogowania
    return
  }
  
  // Odtwarzanie video
}
</script>

<template>
  <div>
    <div v-if="isLoading">Ładowanie kursu...</div>
    <div v-else-if="error">{{ error }}</div>
    <div v-else-if="filteredCourse">
      <h1>{{ filteredCourse.title }}</h1>
      <p>{{ filteredCourse.description }}</p>
      
      <div v-for="video in filteredCourse.videos" :key="video.id">
        <div 
          @click="handleVideoClick(video)"
          :class="{ 
            'opacity-50': !hasAccessToVideo(video, authStore.isAuthenticated) 
          }"
        >
          {{ video.title }}
          <span v-if="video.isTrailer">[Darmowy podgląd]</span>
        </div>
      </div>
    </div>
  </div>
</template>
```

