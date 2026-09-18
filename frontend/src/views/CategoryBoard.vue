<!-- Category board for the practice workflow. -->
<script setup lang="ts">
import { onMounted } from 'vue';
import { useCategoryStore } from '../stores/category';
const store = useCategoryStore();
onMounted(() => { void store.fetch(); });
</script>
<template><section class="p-5 md:p-8"><div class="mb-8"><p class="text-xs uppercase tracking-[0.2em] text-[var(--color-accent)]">Practice board</p><h2 class="mt-2 text-2xl font-semibold">按分类开始练习</h2></div><p v-if="store.loading" role="status">正在加载分类…</p><p v-else-if="store.error" role="alert">{{ store.error }}</p><p v-else-if="!store.items.length">还没有分类，先创建一个分类吧。</p><div v-else class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"><RouterLink v-for="item in store.items" :key="item.id" :to="`/categories/${item.id}/problems`" class="border border-[var(--color-border)] p-4 hover:border-[var(--color-accent)]"><h3 class="font-semibold">{{ item.name }}</h3><p class="mt-3 text-sm text-[var(--color-accent)]">{{ item.problemCount }} 道题目</p></RouterLink></div></section></template>
