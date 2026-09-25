<!-- 题解笔记列表：按 prototype/note-list.html 移植，关键词搜索 + 分页 + 新建笔记。 -->
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { useNoteListStore } from '../stores/noteList';
import PaginationNav from '../components/PaginationNav.vue';
import StateBox from '../components/StateBox.vue';
import Modal from '../components/Modal.vue';
import type { NoteListItem } from '../types';

const store = useNoteListStore();

const rangeLabel = computed(() => {
  const { total, page, pageSize } = store.pagination;
  if (total === 0) return '共 0 条';
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  return `显示第 ${from}–${to} / 共 ${total} 条`;
});
function summary(content: string | null): string { return (content ?? '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().slice(0, 60); }
function relativeTime(iso: string | undefined): string {
  if (!iso) return '—';
  const then = new Date(iso);
  const now = new Date();
  const days = Math.floor((now.getTime() - then.getTime()) / 86400000);
  if (days <= 0) return '今天';
  if (days === 1) return '昨天';
  if (days < 7) return `${days} 天前`;
  const time = then.toTimeString().slice(0, 5);
  if (days < 30) return `${Math.floor(days / 7)} 周前`;
  return `${then.getFullYear()}-${String(then.getMonth() + 1).padStart(2, '0')}-${String(then.getDate()).padStart(2, '0')} ${time}`;
}

const formOpen = ref(false);
const form = ref({ title: '', content: '' });
function openCreate(): void { form.value = { title: '', content: '' }; store.saveError = ''; formOpen.value = true; }
async function save(): Promise<void> { if (!form.value.title.trim() || store.saving) return; const note = await store.create({ title: form.value.title, content: form.value.content || undefined }); if (note) formOpen.value = false; }

onMounted(() => { void store.fetch(); });
</script>
<template>
  <section class="mx-auto flex w-full max-w-[1280px] flex-col">
    <header class="mb-3.5 flex shrink-0 flex-col items-start justify-between gap-4 sm:flex-row">
      <div>
        <h1 class="text-[25px] font-bold tracking-tight text-[var(--color-text)] [font-family:var(--font-heading)]">题解笔记</h1>
        <div class="mt-0.5 flex items-center gap-2 text-[17px] text-[var(--color-text-muted)]">共 <span class="font-semibold text-[var(--color-text)]">{{ store.pagination.total }}</span> 条笔记</div>
      </div>
      <div v-if="!store.loading && !store.error" class="flex shrink-0 items-center gap-2">
        <button class="inline-flex items-center gap-[6px] whitespace-nowrap rounded-[3px] bg-[var(--color-accent)] px-3.5 py-2 text-[15px] font-medium leading-none text-white transition-colors hover:bg-[var(--color-accent-hover)]" @click="openCreate">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="h-[15px] w-[15px]"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          新建笔记
        </button>
      </div>
    </header>

    <div v-if="!store.error" class="mb-3 flex shrink-0 flex-wrap items-center gap-2.5">
      <div class="relative min-w-[220px] max-w-[360px] flex-1">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="pointer-events-none absolute top-1/2 left-[11px] h-[15px] w-[15px] -translate-y-1/2 text-[var(--color-text-muted)]"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input v-model="store.keyword" aria-label="关键词" class="w-full rounded-[3px] border border-[var(--color-border)] bg-[var(--color-surface)] py-2 pr-3 pl-[34px] font-inherit text-[15px] text-[var(--color-text)] transition-colors placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent)] focus:outline-none" placeholder="搜索笔记标题…" @input="void store.search()" />
      </div>
      <span class="ml-auto text-sm text-[var(--color-text-muted)]">{{ rangeLabel }}</span>
    </div>

    <p v-if="store.loading" role="status" class="sr-only">正在加载笔记…</p>
    <div v-if="store.loading" aria-hidden="true" class="overflow-hidden rounded-[3px] border border-[var(--color-border)] bg-[var(--color-surface)]">
      <div class="grid grid-cols-[26px_minmax(0,1fr)_96px_22px] items-center gap-2 border-b border-[var(--color-border)] px-3.5 py-3 lg:grid-cols-[34px_minmax(0,1fr)_58px_58px_108px_22px]">
        <span class="text-right font-mono text-xs font-semibold tracking-[0.05em] text-[var(--color-text-muted)] uppercase">#</span>
        <span class="text-xs font-semibold tracking-[0.05em] text-[var(--color-text-muted)] uppercase">笔记标题</span>
        <span class="hidden text-right text-xs font-semibold tracking-[0.05em] text-[var(--color-text-muted)] uppercase lg:block">关联题目</span>
        <span class="hidden text-right text-xs font-semibold tracking-[0.05em] text-[var(--color-text-muted)] uppercase lg:block">关联错题</span>
        <span class="hidden text-right text-xs font-semibold tracking-[0.05em] text-[var(--color-text-muted)] uppercase lg:block">最近更新</span>
        <span />
      </div>
      <div v-for="n in 8" :key="n" class="flex items-center gap-2.5 border-b border-[var(--color-border)] px-3.5 py-3 last:border-b-0">
        <div class="h-[13px] w-[18px] animate-pulse rounded-[2px] bg-[var(--color-hover)]" />
        <div class="min-w-0 flex-1">
          <div class="h-[13px] w-1/2 animate-pulse rounded-[2px] bg-[var(--color-hover)]" />
          <div class="mt-[7px] h-[11px] w-2/5 animate-pulse rounded-[2px] bg-[var(--color-hover)]" />
        </div>
        <div class="hidden h-[13px] w-8 animate-pulse rounded-[2px] bg-[var(--color-hover)] lg:block" />
        <div class="h-[13px] w-8 animate-pulse rounded-[2px] bg-[var(--color-hover)]" />
      </div>
    </div>

    <StateBox v-else-if="store.error" kind="error" title="加载笔记失败" :desc="store.error">
      <template #icon><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-[26px] w-[26px]"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></template>
      <button class="inline-flex items-center gap-[6px] rounded-[3px] bg-[var(--color-accent)] px-3.5 py-2 text-[15px] font-medium leading-none text-white transition-colors hover:bg-[var(--color-accent-hover)]" @click="store.fetch">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-[15px] w-[15px]"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
        重新加载
      </button>
    </StateBox>

    <StateBox v-else-if="!store.items.length" :title="store.keyword ? '没有找到匹配的笔记' : '还没有题解笔记'" :desc="store.keyword ? '换个关键词试试，或检查标题拼写。' : '暂无已记录的题解笔记。新建第一篇笔记，沉淀你的解题思路与复盘。'">
      <template #icon><svg v-if="store.keyword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-[26px] w-[26px]"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="h-[26px] w-[26px]"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="13" y2="17"/></svg></template>
      <button v-if="!store.keyword" class="inline-flex items-center gap-[6px] rounded-[3px] bg-[var(--color-accent)] px-3.5 py-2 text-[15px] font-medium leading-none text-white transition-colors hover:bg-[var(--color-accent-hover)]" @click="openCreate">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="h-[15px] w-[15px]"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        新建笔记
      </button>
    </StateBox>

    <template v-else>
      <div class="overflow-hidden rounded-[3px] border border-[var(--color-border)] bg-[var(--color-surface)]">
        <div class="grid grid-cols-[26px_minmax(0,1fr)_96px_22px] items-center gap-2 border-b border-[var(--color-border)] px-3.5 py-3 lg:grid-cols-[34px_minmax(0,1fr)_58px_58px_108px_22px]">
          <span class="text-right font-mono text-xs font-semibold tracking-[0.05em] text-[var(--color-text-muted)] uppercase">#</span>
          <span class="text-xs font-semibold tracking-[0.05em] text-[var(--color-text-muted)] uppercase">笔记标题</span>
          <span class="hidden text-right text-xs font-semibold tracking-[0.05em] text-[var(--color-text-muted)] uppercase lg:block">关联题目</span>
          <span class="hidden text-right text-xs font-semibold tracking-[0.05em] text-[var(--color-text-muted)] uppercase lg:block">关联错题</span>
          <span class="hidden text-right text-xs font-semibold tracking-[0.05em] text-[var(--color-text-muted)] uppercase lg:block">最近更新</span>
          <span />
        </div>
        <RouterLink v-for="(note, index) in store.items" :key="note.id" :to="`/notes/${note.id}`" class="group grid grid-cols-[26px_minmax(0,1fr)_96px_22px] items-center gap-2 border-b border-[var(--color-border)] px-3.5 py-3 transition-colors last:border-b-0 hover:bg-[var(--color-hover)] lg:grid-cols-[34px_minmax(0,1fr)_58px_58px_108px_22px]">
          <span class="font-mono text-[13px] text-right text-[var(--color-text-muted)]">{{ (store.pagination.page - 1) * store.pagination.pageSize + index + 1 }}</span>
          <div class="min-w-0">
            <div class="truncate text-base font-medium text-[var(--color-text)] transition-colors group-hover:text-[var(--color-accent)]">{{ note.title }}</div>
            <div v-if="summary(note.content)" class="mt-[3px] truncate text-sm text-[var(--color-text-muted)]">{{ summary(note.content) }}…</div>
          </div>
          <span class="hidden text-right lg:block">
            <span class="block font-mono text-[15px] font-semibold text-[var(--color-text)]" :class="note.problemCount === 0 ? 'font-normal text-[var(--color-text-muted)]' : ''">{{ note.problemCount }}<span class="mt-[1px] block font-sans text-xs font-medium tracking-[0.04em] text-[var(--color-text-muted)] uppercase">题</span></span>
          </span>
          <span class="hidden text-right lg:block">
            <span class="block font-mono text-[15px] font-semibold text-[var(--color-text)]" :class="note.wrongCount === 0 ? 'font-normal text-[var(--color-text-muted)]' : ''">{{ note.wrongCount }}<span class="mt-[1px] block font-sans text-xs font-medium tracking-[0.04em] text-[var(--color-text-muted)] uppercase">错题</span></span>
          </span>
          <span class="hidden text-right text-sm whitespace-nowrap text-[var(--color-text-muted)] lg:block">{{ relativeTime(note.updatedAt) }}</span>
          <span class="ml-auto flex items-center justify-center text-[var(--color-text-muted)] opacity-0 transition-opacity group-hover:opacity-100">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-[15px] w-[15px] group-hover:text-[var(--color-accent)]"><polyline points="9 18 15 12 9 6"/></svg>
          </span>
        </RouterLink>
      </div>
      <PaginationNav class="mb-4" :page="store.pagination.page" :total-pages="store.pagination.totalPages" @page="store.setPage" />
    </template>

    <Modal :open="formOpen" title="新建笔记" @close="formOpen = false">
      <form class="space-y-4" @submit.prevent="save">
        <label class="block text-[15px] font-medium text-[var(--color-text-secondary)]">
          笔记标题
          <input v-model="form.title" aria-label="笔记标题" required maxlength="200" class="mt-1 w-full rounded-[3px] border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-[15px] text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none" />
        </label>
        <label class="block text-[15px] font-medium text-[var(--color-text-secondary)]">
          内容（可选）
          <textarea v-model="form.content" aria-label="笔记内容" rows="6" class="mt-1 w-full rounded-[3px] border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-[15px] text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none" />
        </label>
        <p v-if="store.saveError" role="alert" class="rounded-[3px] border border-[color-mix(in_srgb,var(--danger)_35%,var(--color-border))] px-3 py-2 text-sm text-[var(--danger)]">{{ store.saveError }}</p>
        <div class="flex justify-end gap-3">
          <button type="button" class="rounded-[3px] border border-[var(--color-border)] px-4 py-2 text-[15px] text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-hover)]" @click="formOpen = false">取消</button>
          <button :disabled="store.saving" class="rounded-[3px] bg-[var(--color-accent)] px-4 py-2 text-[15px] font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)] disabled:opacity-50" type="submit">{{ store.saving ? '保存中…' : '保存' }}</button>
        </div>
      </form>
    </Modal>
  </section>
</template>