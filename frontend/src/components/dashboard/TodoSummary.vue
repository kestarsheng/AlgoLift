<!-- 今日待办摘要：从 todo store 加载未完成待办，支持勾选与跳转全部。 -->
<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import { useTodoStore } from '../../stores/todo';
import type { Todo } from '../../types';

const store = useTodoStore();
onMounted(() => { void store.fetch(); });

const pending = computed<Todo[]>(() => store.items.filter((item) => item.status !== 'COMPLETED').slice(0, 4));

const dueLabel = (todo: Todo): string => {
  if (!todo.dueDate) return '未设截止';
  const today = new Date(); today.setUTCHours(0, 0, 0, 0);
  const due = new Date(`${todo.dueDate}T00:00:00.000Z`);
  const diff = Math.round((due.getTime() - today.getTime()) / 86400000);
  if (diff < 0) return '已逾期';
  if (diff === 0) return '今日截止';
  if (diff === 1) return '明日截止';
  if (diff <= 7) return `${diff} 天后截止`;
  return todo.dueDate;
};

const priorityTag = (todo: Todo): { text: string; class: string } => {
  const map = {
    P0: { text: '紧急', class: 'bg-[var(--danger)]/14 text-[var(--danger)]' },
    P1: { text: '普通', class: 'bg-[var(--warning)]/14 text-[var(--warning)]' },
    P2: { text: '低优', class: 'bg-[var(--color-text-muted)]/14 text-[var(--color-text-muted)]' },
  };
  return map[todo.priority];
};
</script>
<template>
  <div class="flex flex-col">
    <div class="mb-2 flex items-center gap-2">
      <span class="text-[17px] font-semibold text-[var(--color-text)]">待办</span>
      <span class="text-[15px] text-[var(--color-text-muted)]">{{ pending.length }} 项未完成</span>
      <RouterLink to="/todos" class="ml-auto text-[15px] font-medium text-[var(--color-accent)] hover:text-[var(--color-accent-hover)]">全部 →</RouterLink>
    </div>
    <p v-if="store.loading" class="py-4 text-center text-[var(--color-text-muted)]">正在加载待办…</p>
    <p v-else-if="store.listError" class="py-4 text-center text-[var(--danger)]">{{ store.listError }}</p>
    <p v-else-if="!pending.length" class="py-4 text-center text-[var(--color-text-muted)]">没有待处理的待办</p>
    <div v-else class="flex flex-col">
      <div v-for="(todo, index) in pending" :key="todo.id" class="flex items-start gap-2 py-2" :class="index > 0 ? 'border-t border-[var(--color-border)]' : ''">
        <button class="mt-px flex h-4 w-4 shrink-0 items-center justify-center rounded-[2px] border-[1.5px] transition-colors" :class="todo.status === 'COMPLETED' ? 'border-[var(--color-accent)] bg-[var(--color-accent)]' : 'border-[var(--color-border)] hover:border-[var(--color-accent)]'" :aria-label="todo.status === 'COMPLETED' ? '标记为未完成' : '标记为已完成'" @click="store.toggle(todo)">
          <svg v-if="todo.status === 'COMPLETED'" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="h-2 w-2"><polyline points="20 6 9 17 4 12"/></svg>
        </button>
        <div class="min-w-0 flex-1">
          <p class="text-base font-medium text-[var(--color-text)]" :class="todo.status === 'COMPLETED' ? 'text-[var(--color-text-muted)] line-through' : ''">{{ todo.title }}</p>
          <div class="mt-px flex items-center gap-1.5 text-sm text-[var(--color-text-muted)]">
            <span :class="todo.isOverdue ? 'text-[var(--danger)]' : ''">{{ dueLabel(todo) }}</span>
            <span class="rounded-[2px] px-1 text-xs font-semibold leading-5" :class="priorityTag(todo).class">{{ priorityTag(todo).text }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>