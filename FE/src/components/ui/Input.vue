<script setup lang="ts">
interface InputProps {
    modelValue?: string
    type?: string
    placeholder?: string
    disabled?: boolean
}

defineProps<InputProps>()

const emit = defineEmits<{
    'update:modelValue': [value: string]
}>()

const onInput = function (e: Event) {
    emit('update:modelValue', (e.target as HTMLInputElement).value)
}
</script>

<template>
    <input
        :value="modelValue"
        @input="onInput"
        :type="type || 'text'"
        :placeholder="placeholder"
        :disabled="disabled"
        class="w-full bg-input-bg placeholder:text-input-placeholder border border-input-border rounded-md px-3 py-2 shadow-sm outline-none transition-colors duration-200 focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
    />
</template>
