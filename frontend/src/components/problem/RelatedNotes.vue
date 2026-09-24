<!-- 关联笔记卡片：展示已关联题解笔记，内联多选集用于整体替换关联。 -->
<script setup lang="ts">
import { ref } from 'vue';
import type { Note } from '../../types';

const props = defineProps<{ notes: Note[]; options: Note[]; saving: boolean; error: string }>();
const emit = defineEmits<{ save: [noteIds: string[]] }>();

const open = ref(false);
const selected = ref<string[]>([]);

/** 打开管理模式时用当前关联初始化选择，关闭时直接收起。 */
const toggle = (): void => {
  if (!open.value) selected.value = props.notes.map((note) => note.id);
  open.value = !open.value;
};
/** 复选切换：避免重复 id。 */
const choose = (id: string, checked: boolean): void => {
  selected.value = checked ? [...new Set([...selected.value, id])] : selected.value.filter((item) => item !== id);
};
const submit = (): void => { emit('save', selected.value); };
</script>
<template>
  <div class="rounded-[3px] border border-[var(--color-border)] bg-[var(--color-surface)] p-3.5">
    <div class="mb-3 flex items-center gap-2">
      <span class="text-[17px] font-semibold text-[var(--color-text)] [font-family:var(--font-heading)]">关联笔记</span>
      <span class="text-[15px] text-[var(--color-text-muted)]">{{ notes.length }}</span>
      <button class="ml-auto inline-flex items-center gap-[5px] text-[15px] font-medium text-[var(--color-accent)] transition-colors hover:text-[var(--color-accent-hover)]" @click="toggle">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-3.5 w-3.5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
        {{ open ? '收起' : '管理关联' }}
      </button>
    </div>

    <div v-if="open" class="mb-3 space-y-2 rounded-[3px] bg-[var(--color-hover)] p-3">
      <p v-if="!options.length" class="text-sm text-[var(--color-text-muted)]">暂无可关联的题解笔记，请先到「题解笔记」页创建。</p>
      <label v-for="note in options" :key="note.id" class="flex items-start gap-2 text-[15px] text-[var(--color-text-secondary)]">
        <input type="checkbox" class="mt-1 accent-[var(--color-accent)]" :checked="selected.includes(note.id)" @change="choose(note.id, ($event.target as HTMLInputElement).checked)" />
        <span class="min-w-0 flex-1 truncate">{{ note.title }}</span>
      </label>
      <p v-if="error" role="alert" class="text-sm text-[var(--danger)]">{{ error }}</p>
      <button :disabled="saving" class="rounded-[3px] bg-[var(--color-accent)] px-[11px] py-[5px] text-sm font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)] disabled:opacity-50" @click="submit">{{ saving ? '保存中…' : '保存关联' }}</button>
    </div>

    <p v-if="!notes.length" class="py-4 text-center text-[15px] text-[var(--color-text-muted)]">暂无关联笔记。</p>
    <div v-else>
      <RouterLink v-for="note in notes" :key="note.id" :to="`/notes/${note.id}`" class="group flex items-start gap-2.5 border-t border-[var(--color-border)] py-2.5 first:border-t-0">
        <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-[3px] bg-[var(--color-accent-light)] text-[var(--color-accent)]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-3.5 w-3.5"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
        </div>
        <div class="min-w-0 flex-1">
          <div class="truncate text-base font-semibold text-[var(--color-text)] transition-colors group-hover:text-[var(--color-accent)]">{{ note.title }}</div>
          <div class="mt-0.5 truncate text-[15px] text-[var(--color-text-muted)]">{{ note.content ? note.content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().slice(0, 60) || '暂无摘要' : '暂无摘要' }}</div>
        </div>
      </RouterLink>
    </div>
  </div>
</template>
