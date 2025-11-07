<script setup lang="ts">
import AdminTableEmpty from './AdminTableEmpty.vue'

interface AdminTableColumn {
  label: string
  align?: 'left' | 'right' | 'center'
}

interface AdminTableProps {
  columns: AdminTableColumn[]
  isEmpty?: boolean
  emptyMessage?: string
}

withDefaults(defineProps<AdminTableProps>(), {
  isEmpty: false,
  emptyMessage: 'Nie znaleziono danych'
})
</script>

<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead class="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
          <tr>
            <th
              v-for="(column, index) in columns"
              :key="index"
              class="px-6 py-4 text-xs font-bold text-gray-700 uppercase tracking-wider"
              :class="{
                'text-left': column.align === 'left' || !column.align,
                'text-right': column.align === 'right',
                'text-center': column.align === 'center'
              }"
            >
              {{ column.label }}
            </th>
          </tr>
        </thead>
        <tbody v-if="!isEmpty" class="bg-white divide-y divide-gray-100">
          <slot name="rows" />
        </tbody>
      </table>
    </div>

    <slot v-if="isEmpty" name="empty">
      <AdminTableEmpty :message="emptyMessage" />
    </slot>
  </div>
</template>

