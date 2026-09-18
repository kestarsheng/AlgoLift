<!-- Compact pagination controls shared by list pages. -->
<script setup lang="ts">
defineProps<{ page: number; totalPages: number }>();
const emit = defineEmits<{ page: [value: number] }>();
</script>
<template><div v-if="totalPages > 1" class="flex items-center justify-between border-t border-[var(--color-border)] pt-4 text-sm"><button class="border border-[var(--color-border)] px-3 py-2 disabled:opacity-40" :disabled="page <= 1" @click="emit('page', page - 1)">上一页</button><span>第 {{ page }} / {{ totalPages }} 页</span><button class="border border-[var(--color-border)] px-3 py-2 disabled:opacity-40" :disabled="page >= totalPages" @click="emit('page', page + 1)">下一页</button></div></template>
