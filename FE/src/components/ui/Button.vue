<script lang="ts" setup>
interface ButtonProps {
    type?: 'fill' | 'outline' | 'ghost'
    variant?: 'primary' | 'secondary' | 'accent'
    disabled?: boolean
}

withDefaults(defineProps<ButtonProps>(), {
    type: 'fill',
    variant: 'primary',
    disabled: false,
})
</script>

<template>
    <button
        :class="[
            'px-4 py-2 rounded transition-colors duration-300 cursor-pointer ',
            type === 'fill'
                ? variant === 'primary'
                    ? 'bg-primary text-white hover:bg-button-primary-hover'
                    : variant === 'secondary'
                      ? 'bg-secondary text-white hover:bg-button-secondary-hover'
                      : 'bg-accent text-text hover:bg-button-accent-hover'
                : '',
            type === 'outline'
                ? variant === 'primary'
                    ? 'border border-primary text-primary hover:bg-primary/10'
                    : variant === 'secondary'
                      ? 'border border-secondary text-secondary hover:bg-secondary/10'
                      : 'border border-accent text-text hover:bg-accent/10'
                : '',
            type === 'ghost'
                ? variant === 'primary'
                    ? 'text-primary hover:bg-primary/10'
                    : variant === 'secondary'
                      ? 'text-secondary hover:bg-secondary/10'
                      : 'text-text hover:bg-accent/10'
                : '',
            disabled ? 'opacity-50 cursor-not-allowed' : '',
        ]"
        :disabled="disabled"
    >
        <slot />
    </button>
</template>
