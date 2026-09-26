<!-- 学习进度列表：按 prototype/progress-list.html 移植，关键词搜索 + 卡片网格 + 分页 + CRUD。 -->
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useProgressStore, type ProgressInput } from '../stores/progress';
import PaginationNav from '../components/PaginationNav.vue';
import StateBox from '../components/StateBox.vue';
import Modal from '../components/Modal.vue';
import { formatDate } from '../utils/date';
import type { Progress } from '../types';

const store = useProgressStore();

const average = computed(() => store.items.length ? Math.round(store.items.reduce((sum, item) => sum + item.progress, 0) / store.items.length) : 0);

const editing = ref<Progress | null>(null);
const formOpen = ref(false);
const form = ref<ProgressInput>({ title: '', progress: 0, progressDate: new Date().toISOString().slice(0, 10), description: '' });
function openCreate(): void { editing.value = null; form.value = { title: '', progress: 0, progressDate: new Date().toISOString().slice(0, 10), description: '' }; store.saveError = ''; formOpen.value = true; }
async function openEdit(item: Progress): Promise<void> { const current = await store.get(item.id); if (current) { editing.value = current; form.value = { title: current.title, progress: current.progress, progressDate: current.progressDate.slice(0, 10), description: current.description ?? '' }; formOpen.value = true; } }
async function save(): Promise<void> { if (!form.value.title.trim() || store.saving) return; const input = { ...form.value, title: form.value.title.trim(), description: form.value.description || undefined }; const result = editing.value ? await store.update(editing.value.id, input) : await store.create(input); if (result) formOpen.value = false; }
async function remove(item: Progress): Promise<void> { if (window.confirm(`确定删除“${item.title}”吗？`)) await store.remove(item.id); }

onMounted(() => { void store.fetch(); });
</script>
<template>
  <section class="mx-auto flex w-full max-w-[1280px] flex-col">
    <header class="mb-3.5 flex shrink-0 flex-col items-start justify-between gap-4 sm:flex-row">
      <div>
        <h1 class="text-[25px] font-bold tracking-tight text-[var(--color-text)] [font-family:var(--font-heading)]">学习进度</h1>
        <div class="mt-0.5 flex items-center gap-2 text-[17px] text-[var(--color-text-muted)]">共 <span class="font-semibold text-[var(--color-text)]">{{ store.pagination.total }}</span> 项主题 · 平均完成度 <span class="font-mono font-semibold text-[var(--color-text)]">{{ average }}</span>%</div>
      </div>
      <div v-if="!store.loading && !store.listError" class="flex shrink-0 items-center gap-2">
        <button class="inline-flex items-center gap-[6px] whitespace-nowrap rounded-[3px] bg-[var(--color-accent)] px-3.5 py-2 text-[15px] font-medium leading-none text-white transition-colors hover:bg-[var(--color-accent-hover)]" @click="openCreate">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="h-[15px] w-[15px]"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          新建进度
        </button>
      </div>
    </header>

    <div v-if="!store.listError" class="mb-3 flex shrink-0 flex-wrap items-center gap-2.5">
      <div class="relative min-w-[220px] max-w-[360px] flex-1">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="pointer-events-none absolute top-1/2 left-[11px] h-[15px] w-[15px] -translate-y-1/2 text-[var(--color-text-muted)]"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input v-model="store.keyword" aria-label="关键词" class="w-full rounded-[3px] border border-[var(--color-border)] bg-[var(--color-surface)] py-2 pr-3 pl-[34px] font-inherit text-[15px] text-[var(--color-text)] transition-colors placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent)] focus:outline-none" placeholder="按主题搜索…" @input="void store.search()" />
      </div>
      <span class="ml-auto text-sm text-[var(--color-text-muted)]">匹配 <b class="font-mono font-semibold text-[var(--color-text)]">{{ store.pagination.total }}</b> 条记录</span>
    </div>

    <p v-if="store.loading" role="status" class="sr-only">正在加载进度…</p>
    <div v-if="store.loading" aria-hidden="true" class="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
      <div v-for="n in 9" :key="n" class="flex flex-col gap-2.5 rounded-[3px] border border-[var(--color-border)] bg-[var(--color-surface)] p-3.5">
        <div class="h-[16px] w-1/2 animate-pulse rounded-[2px] bg-[var(--color-hover)]" />
        <div class="h-[5px] w-full animate-pulse rounded-[2px] bg-[var(--color-hover)]" />
        <div class="h-3 w-full animate-pulse rounded-[2px] bg-[var(--color-hover)]" />
        <div class="h-3 w-3/4 animate-pulse rounded-[2px] bg-[var(--color-hover)]" />
        <div class="h-3 w-1/4 animate-pulse rounded-[2px] bg-[var(--color-hover)]" />
      </div>
    </div>

    <StateBox v-else-if="store.listError" kind="error" title="加载进度失败" :desc="store.listError">
      <template #icon><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-[26px] w-[26px]"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></template>
      <button class="inline-flex items-center gap-[6px] rounded-[3px] bg-[var(--color-accent)] px-3.5 py-2 text-[15px] font-medium leading-none text-white transition-colors hover:bg-[var(--color-accent-hover)]" @click="store.fetch">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-[15px] w-[15px]"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
        重新加载
      </button>
    </StateBox>

    <StateBox v-else-if="!store.items.length" :title="store.keyword ? '没有找到匹配的进度' : '还没有进度记录'" :desc="store.keyword ? '换个关键词试试，或检查主题与描述拼写。' : '新开一个主题或模块，持续追踪你的掌握程度。比如「动态规划」「二叉树遍历」或「图论基础」。'">
      <template #icon><svg v-if="store.keyword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-[26px] w-[26px]"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="h-[26px] w-[26px]"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/></svg></template>
      <button v-if="!store.keyword" class="inline-flex items-center gap-[6px] rounded-[3px] bg-[var(--color-accent)] px-3.5 py-2 text-[15px] font-medium leading-none text-white transition-colors hover:bg-[var(--color-accent-hover)]" @click="openCreate">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="h-[15px] w-[15px]"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        新建进度
      </button>
    </StateBox>

    <template v-else>
      <p v-if="store.deleteError" role="alert" class="mb-2 rounded-[3px] border border-[color-mix(in_srgb,var(--danger)_35%,var(--color-border))] px-3 py-2 text-sm text-[var(--danger)]">{{ store.deleteError }}</p>
      <div class="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
        <article v-for="item in store.items" :key="item.id" class="group flex flex-col gap-2.5 rounded-[3px] border border-[var(--color-border)] bg-[var(--color-surface)] p-3.5 transition-colors hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-light)]">
          <div class="flex items-start justify-between gap-2">
            <h3 class="truncate text-[17px] font-semibold text-[var(--color-text)]">{{ item.title }}</h3>
            <div class="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              <button aria-label="编辑" class="flex h-6 w-6 cursor-pointer items-center justify-center rounded-[2px] text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-hover)] hover:text-[var(--color-text)]" @click="openEdit(item)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-[14px] w-[14px]"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button aria-label="删除" class="flex h-6 w-6 cursor-pointer items-center justify-center rounded-[2px] text-[var(--color-text-muted)] transition-colors hover:bg-[color-mix(in_srgb,var(--danger)_12%,transparent)] hover:text-[var(--danger)]" :disabled="store.deleting" @click="remove(item)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-[14px] w-[14px]"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
          </div>
          <div class="flex items-center gap-2.5">
            <div class="h-[5px] flex-1 overflow-hidden rounded-[2px] bg-[var(--color-hover)]">
              <div class="h-full rounded-[2px] bg-[var(--color-accent)] transition-[width] duration-500" :style="{ width: `${item.progress}%` }" role="progressbar" :aria-valuenow="item.progress" aria-valuemin="0" aria-valuemax="100" />
            </div>
            <span class="w-11 text-right font-mono text-[15px] font-bold tracking-tight text-[var(--color-text)]">{{ item.progress }}%</span>
          </div>
          <p v-if="item.description" class="line-clamp-2 min-h-[46px] text-[15px] leading-[1.55] text-[var(--color-text-secondary)]">{{ item.description }}</p>
          <div class="mt-auto flex items-center gap-1 text-[13px] text-[var(--color-text-muted)]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-[11px] w-[11px]"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            <span class="font-mono tracking-[0.01em]">更新于 {{ formatDate(item.progressDate) }}</span>
          </div>
        </article>
      </div>
      <PaginationNav class="mb-4" :page="store.pagination.page" :total-pages="store.pagination.totalPages" @page="store.setPage" />
    </template>

    <Modal :open="formOpen" :title="editing ? '编辑进度' : '新建进度'" @close="formOpen = false">
      <form class="space-y-4" @submit.prevent="save">
        <label class="block text-[15px] font-medium text-[var(--color-text-secondary)]">
          主题
          <input v-model="form.title" aria-label="标题" required class="mt-1 w-full rounded-[3px] border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-[15px] text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none" />
        </label>
        <div class="grid grid-cols-2 gap-3">
          <label class="block text-[15px] font-medium text-[var(--color-text-secondary)]">
            进度（0-100）
            <input v-model.number="form.progress" aria-label="进度" type="number" min="0" max="100" required class="mt-1 w-full rounded-[3px] border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-[15px] text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none" />
          </label>
          <label class="block text-[15px] font-medium text-[var(--color-text-secondary)]">
            日期
            <input v-model="form.progressDate" aria-label="日期" type="date" required class="mt-1 w-full rounded-[3px] border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-[15px] text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none" />
          </label>
        </div>
        <label class="block text-[15px] font-medium text-[var(--color-text-secondary)]">
          描述
          <textarea v-model="form.description" aria-label="描述" class="mt-1 w-full rounded-[3px] border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-[15px] text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none" />
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