<!-- 刷题练习分类看板：按 prototype/category-board.html 移植，数据来自 GET /api/categories。 -->
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useCategoryStore } from '../stores/category';
import CategoryCard from '../components/category/CategoryCard.vue';
import CategoryModal from '../components/category/CategoryModal.vue';
import type { Category } from '../types';

const store = useCategoryStore();

const modalOpen = ref(false);
const editing = ref<Category | null>(null);
const confirming = ref<Category | null>(null);

const totalProblems = computed(() => store.items.reduce((sum, item) => sum + item.problemCount, 0));

/** 打开新建模态框（无编辑目标）。 */
const openCreate = (): void => { editing.value = null; store.saveError = ''; modalOpen.value = true; };
/** 打开编辑模态框并回填当前分类名称。 */
const openEdit = (category: Category): void => { editing.value = category; store.saveError = ''; modalOpen.value = true; };

/** 提交新建或编辑；成功后关闭模态框，失败时保留错误提示。 */
const submitModal = async (name: string): Promise<void> => {
  const target = editing.value;
  const result = target ? await store.rename(target.id, name) : await store.create(name);
  if (result) modalOpen.value = false;
};

/** 二次确认后删除分类。 */
const confirmRemove = async (): Promise<void> => {
  if (!confirming.value) return;
  if (await store.remove(confirming.value.id)) confirming.value = null;
};

onMounted(() => store.fetch(true));
</script>
<template>
  <section class="mx-auto flex w-full max-w-[1280px] flex-col">
    <header class="mb-4 flex shrink-0 flex-col items-start justify-between gap-4 sm:flex-row">
      <div>
        <h1 class="text-[25px] font-bold tracking-tight text-[var(--color-text)] [font-family:var(--font-heading)]">刷题练习</h1>
        <div class="mt-0.5 flex items-center gap-2 text-[17px] text-[var(--color-text-muted)]">
          按分类整理题目，共 <span class="font-semibold text-[var(--color-text)]">{{ store.items.length }}</span> 个分类 · {{ totalProblems }} 题
        </div>
      </div>
      <div v-if="!store.loading && !store.error" class="flex shrink-0 items-center gap-2">
        <button class="inline-flex items-center gap-[6px] whitespace-nowrap rounded-[3px] border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2 text-[15px] font-medium leading-none text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-hover)] hover:text-[var(--color-text)]" @click="openCreate">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="h-[15px] w-[15px]"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          新建分类
        </button>
      </div>
    </header>

    <p v-if="store.loading" role="status" class="sr-only">正在加载分类…</p>
    <div v-if="store.loading" class="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-hidden="true">
      <div v-for="n in 8" :key="n" class="flex animate-pulse flex-col gap-2.5 rounded-[3px] border border-[var(--color-border)] bg-[var(--color-surface)] p-3.5">
        <div class="h-4 w-1/2 rounded-[2px] bg-[var(--color-hover)]" />
        <div class="h-6 w-[38%] rounded-[2px] bg-[var(--color-hover)]" />
        <div class="h-3 w-2/5 rounded-[2px] bg-[var(--color-hover)]" />
      </div>
    </div>

    <div v-else-if="store.error" class="flex min-h-[320px] flex-col items-center justify-center gap-3.5 rounded-[3px] border border-[var(--color-border)] bg-[var(--color-surface)] p-12 text-center">
      <div class="flex h-[54px] w-[54px] items-center justify-center rounded-[3px] bg-[color-mix(in_srgb,var(--danger)_12%,transparent)] text-[var(--danger)]">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-[26px] w-[26px]"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
      </div>
      <div class="text-[19px] font-semibold text-[var(--color-text)] [font-family:var(--font-heading)]">加载分类失败</div>
      <div class="max-w-[380px] text-[15px] leading-normal text-[var(--color-text-muted)]">{{ store.error }}</div>
      <button class="inline-flex items-center gap-[6px] rounded-[3px] bg-[var(--color-accent)] px-3.5 py-2 text-[15px] font-medium leading-none text-white transition-colors hover:bg-[var(--color-accent-hover)]" @click="store.fetch(true)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-[15px] w-[15px]"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
        重新加载
      </button>
    </div>

    <div v-else-if="!store.items.length" class="flex min-h-[320px] flex-col items-center justify-center gap-3.5 rounded-[3px] border border-[var(--color-border)] bg-[var(--color-surface)] p-12 text-center">
      <div class="flex h-[54px] w-[54px] items-center justify-center rounded-[3px] bg-[var(--color-hover)] text-[var(--color-text-muted)]">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="h-[26px] w-[26px]"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/></svg>
      </div>
      <div class="text-[19px] font-semibold text-[var(--color-text)] [font-family:var(--font-heading)]">还没有分类</div>
      <div class="max-w-[380px] text-[15px] leading-normal text-[var(--color-text-muted)]">创建你的第一个题目分类，开始系统化刷题之旅。可以按算法主题、数据结构或难度来组织。</div>
      <button class="inline-flex items-center gap-[6px] rounded-[3px] bg-[var(--color-accent)] px-3.5 py-2 text-[15px] font-medium leading-none text-white transition-colors hover:bg-[var(--color-accent-hover)]" @click="openCreate">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="h-[15px] w-[15px]"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        新建分类
      </button>
    </div>

    <template v-else>
      <p v-if="store.deleteError" role="alert" class="mb-2 rounded-[3px] border border-[color-mix(in_srgb,var(--danger)_35%,var(--color-border))] px-3 py-2 text-sm text-[var(--danger)]">{{ store.deleteError }}</p>
      <div class="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <CategoryCard v-for="category in store.items" :key="category.id" :category="category" :disabled="store.deleting" @edit="openEdit" @remove="confirming = $event" />
        <button class="flex min-h-[132px] flex-col items-center justify-center gap-1.5 rounded-[3px] border-[1.5px] border-dashed border-[var(--color-border)] p-3.5 text-[var(--color-text-muted)] transition-colors hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-light)] hover:text-[var(--color-accent)]" @click="openCreate">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-[22px] w-[22px]"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          <span class="text-[15px] font-medium">新建分类</span>
        </button>
      </div>
    </template>

    <CategoryModal :open="modalOpen" :editing="editing" :saving="store.saving" :error="store.saveError" @submit="submitModal" @close="modalOpen = false" />

    <div v-if="confirming" class="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4" @click.self="confirming = null">
      <div class="w-full max-w-sm space-y-4 rounded-[3px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <h3 class="text-xl font-semibold text-[var(--color-text)] [font-family:var(--font-heading)]">删除分类</h3>
        <p class="text-[15px] leading-relaxed text-[var(--color-text-secondary)]">确认删除「{{ confirming.name }}」吗？该分类下的 {{ confirming.problemCount }} 道题目不会被删除，只会解除分类关联。此操作不可撤销。</p>
        <div class="flex justify-end gap-3">
          <button class="rounded-[3px] border border-[var(--color-border)] px-4 py-2 text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-hover)]" @click="confirming = null">取消</button>
          <button :disabled="store.deleting" class="rounded-[3px] bg-[var(--danger)] px-4 py-2 font-medium text-white transition-opacity disabled:opacity-50" @click="confirmRemove">{{ store.deleting ? '删除中…' : '确认删除' }}</button>
        </div>
      </div>
    </div>
  </section>
</template>
