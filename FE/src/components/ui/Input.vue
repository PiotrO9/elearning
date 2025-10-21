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
        class="bg-input-background focus:bg-input-background-focus outline-0 duration-300 p-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
    />
</template>
