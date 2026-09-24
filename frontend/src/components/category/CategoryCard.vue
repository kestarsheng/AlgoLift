<!-- 分类卡片：整卡可点击跳转分类题目列表，右上角编辑/删除按钮阻止冒泡。 -->
<script setup lang="ts">
import { useRouter } from 'vue-router';
import type { Category } from '../types';

const props = defineProps<{ category: Category; disabled?: boolean }>();
const emit = defineEmits<{ edit: [category: Category]; remove: [category: Category] }>();

const router = useRouter();

/** 整卡跳转到该分类的题目列表；`/categories/:categoryId/problems`。 */
const open = (): void => { if (!props.disabled) void router.push(`/categories/${props.category.id}/problems`); };
</script>
<template>
  <div
    class="group flex cursor-pointer flex-col gap-2.5 rounded-[3px] border border-[var(--color-border)] bg-[var(--color-surface)] p-3.5 transition-colors hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-light)]"
    :class="disabled ? 'pointer-events-none opacity-50' : ''"
    role="link"
    tabindex="0"
    @click="open"
    @keydown.enter.prevent="open"
    @keydown.space.prevent="open"
  >
    <div class="flex items-center justify-between gap-2">
      <div class="truncate text-[17px] font-semibold text-[var(--color-text)]">{{ category.name }}</div>
      <div class="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
        <button class="flex h-6 w-6 items-center justify-center rounded-[2px] text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-hover)] hover:text-[var(--color-text)]" title="编辑分类" aria-label="编辑分类" @click.stop="emit('edit', category)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-3.5 w-3.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
        <button class="flex h-6 w-6 items-center justify-center rounded-[2px] text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-hover)] hover:text-[var(--danger)]" title="删除分类" aria-label="删除分类" @click.stop="emit('remove', category)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-3.5 w-3.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        </button>
      </div>
    </div>
    <div class="flex items-baseline gap-[5px]">
      <span class="font-mono text-[27px] font-bold leading-none tracking-tight text-[var(--color-text)]">{{ category.problemCount }}</span>
      <span class="text-[15px] text-[var(--color-text-muted)]">题</span>
    </div>
    <div class="flex items-center gap-2 text-[13px] text-[var(--color-text-muted)]">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-3 w-3"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
      {{ category.problemCount > 0 ? '点击进入题目列表' : '暂无题目，点击添加' }}
    </div>
  </div>
</template>
