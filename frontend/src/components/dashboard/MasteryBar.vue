<!-- 分类掌握度条：分类名 + 进度轨道 + 百分比，点击跳转对应分类题目列表。 -->
<script setup lang="ts">
import { RouterLink } from 'vue-router';
defineProps<{ id: string; name: string; percent: number }>();
</script>
<template>
  <RouterLink :to="`/categories/${id}/problems`" class="flex items-center gap-2 rounded-[3px] py-1 transition-colors hover:bg-[var(--color-hover)]">
    <span class="w-20 shrink-0 text-base font-medium text-[var(--color-text-secondary)]">{{ name }}</span>
    <div class="h-[5px] flex-1 overflow-hidden rounded-[2px] bg-[var(--color-hover)]">
      <div class="h-full rounded-[2px] bg-[var(--color-accent)] transition-[width] duration-500" :style="{ width: `${percent}%` }" />
    </div>
    <span class="w-9 text-right font-mono text-[15px] font-semibold text-[var(--color-text)]">{{ percent }}%</span>
  </RouterLink>
</template>