<script setup lang="ts">
interface AdminTableRowProps {
  item: any
}

defineProps<AdminTableRowProps>()
</script>

<template>
  <tr class="hover:bg-purple-50/50 transition-all duration-150 border-l-4 border-transparent hover:border-purple-500 group">
    <slot :item="item" />
  </tr>
</template>

