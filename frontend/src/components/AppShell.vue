<!-- Responsive application navigation shared by all frontend routes. -->
<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
const route = useRoute();
const navigation = [{ label: '错题本', path: '/wrongs' }, { label: '题解笔记', path: '/notes' }];
const activePath = computed(() => route.path.startsWith('/notes') ? '/notes' : '/wrongs');
</script>
<template>
  <div class="min-h-screen md:grid md:grid-cols-[220px_1fr]">
    <aside class="border-b border-[var(--color-border)] bg-[var(--color-bg)] p-4 md:min-h-screen md:border-b-0 md:border-r md:p-6">
      <div class="flex items-baseline justify-between md:block"><p class="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-accent)]">AlgoLift</p><h1 class="mt-1 text-lg font-semibold tracking-tight">算法学习工作台</h1></div>
      <nav class="mt-5 flex gap-2 md:mt-12 md:block md:space-y-2" aria-label="主导航">
        <RouterLink v-for="item in navigation" :key="item.path" :to="item.path" :aria-current="activePath === item.path ? 'page' : undefined" class="block border px-3 py-2 text-sm transition-colors" :class="activePath === item.path ? 'border-[var(--color-accent)] bg-[var(--color-accent-light)] font-semibold text-[var(--color-text)]' : 'border-transparent hover:border-[var(--color-border)]'">{{ item.label }}</RouterLink>
      </nav>
    </aside>
    <main class="min-w-0"><slot /></main>
  </div>
</template>
