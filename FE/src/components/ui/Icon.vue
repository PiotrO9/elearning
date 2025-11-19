<script setup lang="ts">
import { ref, watch, computed } from 'vue'

interface IconProps {
    name: string
    class?: string
    ariaLabel?: string
    ariaHidden?: boolean
}

const props = withDefaults(defineProps<IconProps>(), {
    class: '',
    ariaHidden: false
})

const svgContent = ref<string>('')
const isLoading = ref(true)

async function loadIcon(iconName: string) {
    isLoading.value = true
    try {
        const iconModule = await import(`@/assets/icons/${iconName}.svg?raw`)
        svgContent.value = iconModule.default
    } catch (error) {
        console.warn(`Icon "${iconName}" not found:`, error)
        svgContent.value = ''
    } finally {
        isLoading.value = false
    }
}

const processedSvg = computed(() => {
    if (!svgContent.value) {
        return ''
    }

    let svg = svgContent.value

    if (!svg.includes('currentColor') && svg.includes('stroke=')) {
        svg = svg.replace(/stroke="[^"]*"/g, 'stroke="currentColor"')
    }
    if (!svg.includes('currentColor') && svg.includes('fill=')) {
        svg = svg.replace(/fill="[^"]*"/g, 'fill="currentColor"')
    }

    if (props.class) {
        if (svg.includes('class=')) {
            svg = svg.replace(/class="([^"]*)"/, `class="$1 ${props.class}"`)
        } else {
            svg = svg.replace('<svg', `<svg class="${props.class}"`)
        }
    }

    return svg
})

const iconStyle = computed(() => {
    const style: Record<string, string> = {
        '--icon-size': '20px',
        '--icon-color': 'currentColor',
        color: 'var(--icon-color)'
    }

    if (!props.class || (!props.class.includes('w-') && !props.class.includes('h-'))) {
        style.width = 'var(--icon-size)'
        style.height = 'var(--icon-size)'
    }

    return style
})

watch(() => props.name, (newName) => {
    if (newName) {
        loadIcon(newName)
    }
}, { immediate: true })

watch(() => props.class, () => {
    if (svgContent.value) {
        loadIcon(props.name)
    }
})
</script>

<template>
<span
    v-if="!isLoading && processedSvg"
    v-html="processedSvg"
    :aria-label="ariaLabel"
    :aria-hidden="ariaHidden ? 'true' : undefined"
    :style="iconStyle"
    :class="props.class"
    class="inline-flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:text-[var(--icon-color)]"
/>
<span v-else-if="isLoading" :style="iconStyle" class="inline-block" />
<span v-else class="text-red-500 text-xs">Icon not found</span>
</template>

