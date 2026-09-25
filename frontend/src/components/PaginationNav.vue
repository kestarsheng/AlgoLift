<!-- 通用分页器：原型 pager 风格，上一页/数字/省略号/下一页；仅当总页数 > 1 时显示。 -->
<script setup lang="ts">
import { computed } from 'vue';
const props = defineProps<{ page: number; totalPages: number }>();
const emit = defineEmits<{ page: [value: number] }>();

const pageList = computed<(number | '…')[]>(() => {
  const total = props.totalPages;
  const cur = props.page;
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);
  const set = new Set<number>([1, total, cur - 1, cur, cur + 1]);
  const sorted = [...set].filter((value) => value >= 1 && value <= total).sort((a, b) => a - b);
  const result: (number | '…')[] = [];
  let previous = 0;
  for (const value of sorted) { if (value - previous > 1) result.push('…'); result.push(value); previous = value; }
  return result;
});
</script>
<template>
  <div v-if="props.totalPages > 1" class="mt-3.5 flex shrink-0 items-center justify-center gap-1">
    <button :disabled="props.page <= 1" title="上一页" class="flex h-8 min-w-8 items-center justify-center rounded-[3px] border border-[var(--color-border)] bg-[var(--color-surface)] px-2 font-mono text-sm font-medium text-[var(--color-text-secondary)] transition-colors hover:not-disabled:bg-[var(--color-hover)] hover:not-disabled:text-[var(--color-text)] disabled:opacity-40 disabled:cursor-not-allowed" @click="emit('page', props.page - 1)">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-[15px] w-[15px]"><polyline points="15 18 9 12 15 6"/></svg>
    </button>
    <template v-for="(item, index) in pageList" :key="index">
      <span v-if="item === '…'" class="px-1 font-mono text-sm text-[var(--color-text-muted)]">…</span>
      <button v-else :class="item === props.page ? 'border-[var(--color-accent-light)] bg-[var(--color-accent-light)] font-bold text-[var(--color-accent)]' : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-hover)] hover:text-[var(--color-text)]'" class="flex h-8 min-w-8 items-center justify-center rounded-[3px] border bg-[var(--color-surface)] px-2 font-mono text-sm font-medium transition-colors" @click="emit('page', item)">{{ item }}</button>
    </template>
    <button :disabled="props.page >= props.totalPages" title="下一页" class="flex h-8 min-w-8 items-center justify-center rounded-[3px] border border-[var(--color-border)] bg-[var(--color-surface)] px-2 font-mono text-sm font-medium text-[var(--color-text-secondary)] transition-colors hover:not-disabled:bg-[var(--color-hover)] hover:not-disabled:text-[var(--color-text)] disabled:opacity-40 disabled:cursor-not-allowed" @click="emit('page', props.page + 1)">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-[15px] w-[15px]"><polyline points="9 18 15 12 9 6"/></svg>
    </button>
  </div>
</template>