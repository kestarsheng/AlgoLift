<!-- 统计卡片：支持普通模式（label+value+sub）与 hero 模式（含进度环 slot）。 -->
<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(defineProps<{ label: string; tone?: 'blue' | 'green' | 'amber' | 'slate'; hero?: boolean }>(), { tone: 'blue', hero: false });

const toneClass = computed(() => {
  const map = {
    blue: { bg: 'bg-[var(--color-accent)]/14', text: 'text-[var(--color-accent)]' },
    green: { bg: 'bg-[var(--success)]/14', text: 'text-[var(--success)]' },
    amber: { bg: 'bg-[var(--warning)]/14', text: 'text-[var(--warning)]' },
    slate: { bg: 'bg-[var(--color-text-muted)]/14', text: 'text-[var(--color-text-muted)]' },
  };
  return map[props.tone];
});
</script>
<template>
  <div class="flex flex-col rounded-[3px] border border-[var(--color-border)] bg-[var(--color-surface)] p-3.5">
    <div class="flex items-center justify-between">
      <span class="text-base font-medium text-[var(--color-text-muted)]">{{ label }}</span>
      <span class="flex h-6 w-6 items-center justify-center rounded-[3px]" :class="[toneClass.bg, toneClass.text]"><slot name="icon" /></span>
    </div>
    <div :class="hero ? 'mt-1 flex items-center gap-4' : 'mt-1'"><slot /></div>
  </div>
</template>