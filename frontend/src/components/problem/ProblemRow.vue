<!-- 题目列表行：与表头共用 7 列栅格（原型 .plist-row），小屏隐藏练习次数与笔记列。 -->
<script setup lang="ts">
import type { Difficulty, ProblemListItem } from '../types';

defineProps<{ problem: ProblemListItem; index: number }>();

const emit = defineEmits<{ open: [problem: ProblemListItem] }>();

const DIFFICULTY_LABEL: Record<Difficulty, string> = { EASY: '简单', MEDIUM: '中等', HARD: '困难' };
const DIFFICULTY_TAG: Record<Difficulty, string> = {
  EASY: 'bg-[color-mix(in_srgb,var(--success)_14%,transparent)] text-[var(--success)]',
  MEDIUM: 'bg-[color-mix(in_srgb,var(--warning)_18%,transparent)] text-[var(--warning)]',
  HARD: 'bg-[color-mix(in_srgb,var(--danger)_14%,transparent)] text-[var(--danger)]',
};

/** 把 ISO 日期格式化为与原型一致的相对时间文案。 */
const relativeTime = (value: string | null): string => {
  if (!value) return '—';
  const day = 24 * 60 * 60 * 1000;
  const diff = Math.floor((Date.now() - new Date(value).getTime()) / day);
  if (diff <= 0) return '今天';
  if (diff === 1) return '昨天';
  if (diff < 7) return `${diff} 天前`;
  if (diff < 30) return `${Math.floor(diff / 7)} 周前`;
  return `${Math.floor(diff / 30)} 个月前`;
};
</script>
<template>
  <div
    class="group grid cursor-pointer grid-cols-[26px_1fr_64px_84px_22px] items-center gap-2 border-b border-[var(--color-border)] px-3.5 py-[11px] transition-colors last:border-b-0 hover:bg-[var(--color-hover)] sm:grid-cols-[34px_1fr_72px_84px_60px_104px_22px] sm:gap-2.5"
    role="link"
    tabindex="0"
    @click="emit('open', problem)"
    @keydown.enter.prevent="emit('open', problem)"
  >
    <div class="text-right font-mono text-[13px] text-[var(--color-text-muted)]">{{ index }}</div>
    <div class="truncate text-base font-medium text-[var(--color-text)] transition-colors group-hover:text-[var(--color-accent)]">{{ problem.title }}</div>
    <div class="text-center">
      <span class="inline-flex min-w-[48px] items-center justify-center rounded-[3px] px-[9px] py-0.5 text-xs font-semibold leading-[18px]" :class="DIFFICULTY_TAG[problem.difficulty]">{{ DIFFICULTY_LABEL[problem.difficulty] }}</span>
    </div>
    <div class="hidden text-right font-mono text-[15px] font-semibold text-[var(--color-text)] sm:block">{{ problem.practiceCount }}</div>
    <div class="hidden text-right font-mono text-[15px] font-semibold text-[var(--color-text)] sm:block">{{ problem.noteCount }}</div>
    <div class="whitespace-nowrap text-right text-sm text-[var(--color-text-muted)]">{{ relativeTime(problem.lastPracticedAt) }}</div>
    <div class="flex items-center justify-center text-[var(--color-text-muted)] opacity-0 transition-opacity group-hover:opacity-100 group-hover:text-[var(--color-accent)]">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-[15px] w-[15px]"><polyline points="9 18 15 12 9 6"/></svg>
    </div>
  </div>
</template>
