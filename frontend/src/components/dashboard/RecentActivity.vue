<!-- 最近掌握的知识点：知识卡网格，展示标题、描述与掌握度进度条。 -->
<script setup lang="ts">
import { RouterLink } from 'vue-router';
import type { KnowledgeItem } from '../../stores/dashboard';
defineProps<{ items: KnowledgeItem[] }>();
</script>
<template>
  <div v-if="items.length" class="grid grid-cols-1 gap-2 sm:grid-cols-2">
    <RouterLink v-for="item in items" :key="item.id" to="/progress" class="flex flex-col rounded-[3px] border border-[var(--color-border)] p-2.5 transition-colors hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-light)]">
      <span class="text-[17px] font-semibold text-[var(--color-text)]">{{ item.title }}</span>
      <span class="mt-0.5 flex-1 text-[15px] text-[var(--color-text-muted)]">{{ item.description || '持续练习中' }}</span>
      <div class="mt-1.5 flex items-center gap-2">
        <div class="h-[3px] flex-1 overflow-hidden rounded-[2px] bg-[var(--color-hover)]">
          <div class="h-full rounded-[2px] bg-[var(--color-accent)] transition-[width] duration-500" :style="{ width: `${item.percent}%` }" />
        </div>
        <span class="font-mono text-sm font-semibold text-[var(--color-text)]">{{ item.percent }}%</span>
      </div>
    </RouterLink>
  </div>
  <p v-else class="py-6 text-center text-[var(--color-text-muted)]">还没有掌握记录</p>
</template>