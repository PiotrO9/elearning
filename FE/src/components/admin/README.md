# Komponenty Admina

## CourseForm.vue

Formularz do dodawania i edycji kursów w panelu administracyjnym.

### Props

```typescript
interface Props {
  course?: CourseListItem | null  // Kurs do edycji (null = nowy kurs)
  allTags: Tag[]                   // Lista wszystkich dostępnych tagów
  isLoading?: boolean              // Stan ładowania (disabled inputs)
}
```

### Events

```typescript
{
  save: [data: CreateCourseInput | UpdateCourseInput, tagIds: string[]]
  cancel: []
}
```

### Funkcjonalności

#### 1. **Walidacja**
Formularz waliduje wszystkie pola zgodnie z wymaganiami API:
- **Tytuł**: 3-120 znaków (wymagane)
- **Krótki opis**: 10-300 znaków (wymagane)
- **Pełny opis**: minimum 10 znaków (wymagane)
- **Ścieżka obrazu**: wymagane

#### 2. **Liczniki znaków**
Wszystkie pola tekstowe pokazują licznik znaków w czasie rzeczywistym:
- Tytuł: (X/120)
- Krótki opis: (X/300)
- Pełny opis: (X znaków)

#### 3. **Preview obrazu**
Gdy użytkownik wpisze ścieżkę do obrazu, formularz automatycznie pokazuje podgląd.

#### 4. **Wybór tagów**
- Lista przycisków z wszystkimi dostępnymi tagami
- Kliknięcie przycisku toggle'uje wybór tagu
- Wybrane tagi są podświetlone na niebiesko
- Jeśli brak tagów, pokazuje komunikat

#### 5. **Checkboxy**
- **Opublikowany**: Kurs widoczny na liście
- **Publiczny**: Użytkownicy mogą dołączyć samodzielnie

#### 6. **Markdown**
Pole "Pełny opis" wspiera formatowanie Markdown:
- Nagłówki (`##`, `###`)
- Pogrubienie (`**tekst**`)
- Listy (`-`, `1.`)
- Linki, obrazy, etc.

### Użycie

```vue
<script setup>
import CourseForm from '@/components/admin/CourseForm.vue'
import { ref } from 'vue'

const tags = ref([...])
const selectedCourse = ref(null) // lub obiekt kursu do edycji
const isSaving = ref(false)

async function handleSave(data, tagIds) {
  isSaving.value = true
  try {
    // Zapisz kurs
    await saveCourse(data, tagIds)
  } finally {
    isSaving.value = false
  }
}

function handleCancel() {
  // Zamknij modal
}
</script>

<template>
  <CourseForm
    :course="selectedCourse"
    :all-tags="tags"
    :is-loading="isSaving"
    @save="handleSave"
    @cancel="handleCancel"
  />
</template>
```

### Przykład danych wejściowych/wyjściowych

#### Input (edycja kursu):
```typescript
{
  course: {
    id: "cm4abc123",
    title: "Vue 3 Masterclass",
    summary: "Kompletny kurs Vue 3",
    descriptionMarkdown: "## O kursie\n\nNaucz się Vue 3...",
    imagePath: "/images/vue-course.jpg",
    isPublished: true,
    isPublic: false,
    tags: [
      { id: "tag1", name: "Vue", slug: "vue" },
      { id: "tag2", name: "JavaScript", slug: "javascript" }
    ]
  },
  allTags: [
    { id: "tag1", name: "Vue", slug: "vue" },
    { id: "tag2", name: "JavaScript", slug: "javascript" },
    { id: "tag3", name: "TypeScript", slug: "typescript" }
  ]
}
```

#### Output (przy zapisie):
```typescript
// data
{
  title: "Vue 3 Masterclass",
  summary: "Kompletny kurs Vue 3",
  descriptionMarkdown: "## O kursie\n\nNaucz się Vue 3...",
  imagePath: "/images/vue-course.jpg",
  isPublished: true,
  isPublic: false
}

// tagIds
["tag1", "tag2"]
```

### Integracja z API

Po otrzymaniu eventu `save`, komponent rodzic powinien:

1. **Tworzenie nowego kursu:**
```typescript
// 1. Stwórz kurs
const response = await createCourse(data)
const courseId = response.data.id

// 2. Przypisz tagi
if (tagIds.length > 0) {
  await assignTagsToCourse(courseId, tagIds)
}
```

2. **Edycja istniejącego kursu:**
```typescript
// 1. Zaktualizuj kurs
await updateCourse(courseId, data)

// 2. Przypisz tagi (zastępuje wszystkie poprzednie)
if (tagIds.length > 0) {
  await assignTagsToCourse(courseId, tagIds)
}
```

### Błędy i komunikaty

Formularz wyświetla błędy walidacji pod polami w kolorze czerwonym:
- "Tytuł jest wymagany"
- "Tytuł musi mieć minimum 3 znaki"
- "Krótki opis musi mieć minimum 10 znaków"
- etc.

### Stylowanie

Formularz używa Tailwind CSS z:
- Focusem na ring-2 ring-blue-500
- Czerwonymi borderami dla błędów
- Disabled states gdy `isLoading=true`
- Responsywnością

### Dostępność

- Wszystkie pola mają `<label>`
- Komunikaty błędów są powiązane z polami
- Przyciski mają odpowiednie `disabled` states
- Checkbox'y mają odpowiednie `aria-*` atrybuty

## AdminNav.vue

Nawigacja panelu administracyjnego.

### Funkcjonalności

- Podświetla aktywną sekcję
- Link "Wróć do strony głównej"
- Responsywna

### Użycie

```vue
<template>
  <div>
    <AdminNav />
    <MaxWidthWrapper>
      <!-- Zawartość strony -->
    </MaxWidthWrapper>
  </div>
</template>
```

## Przyszłe komponenty

### VideoForm.vue (TODO)
Formularz do zarządzania wideo w kursach.

### ImageUploader.vue (TODO)
Komponent do uploadu i zarządzania obrazami kursów.

### UserRoleToggle.vue (TODO)
Komponent do zmiany roli użytkownika (USER ↔ ADMIN).

