<script setup lang="ts">
defineProps<{
  modelValue?: string
  type?: string
  placeholder?: string
  disabled?: boolean
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <input 
    :value="modelValue"
    @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    :type="type || 'text'"
    :placeholder="placeholder"
    :disabled="disabled"
    class="bg-zinc-100 focus:bg-zinc-200 outline-0 duration-300 p-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
  >
</template>