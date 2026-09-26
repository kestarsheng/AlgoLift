<!-- 题目详情：按 prototype/problem-detail.html 移植，数据来自 GET /api/problems/:problemId，含编辑题目、管理分类、关联笔记与删除。 -->
<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useProblemDetailStore } from '../stores/problemDetail';
import { useProblemManagementStore } from '../stores/problemManagement';
import { usePracticeRecordStore } from '../stores/practiceRecord';
import PracticeRecordList from '../components/problem/PracticeRecordList.vue';
import RelatedNotes from '../components/problem/RelatedNotes.vue';
import { formatDate } from '../utils/date';
import type { Difficulty } from '../types';

const route = useRoute();
const router = useRouter();
const problem = useProblemDetailStore();
const management = useProblemManagementStore();
const practice = usePracticeRecordStore();
const problemId = computed(() => String(route.params.problemId ?? ''));

const DIFFICULTY_LABEL: Record<Difficulty, string> = { EASY: '简单', MEDIUM: '中等', HARD: '困难' };
const DIFFICULTY_TAG: Record<Difficulty, string> = {
  EASY: 'bg-[color-mix(in_srgb,var(--success)_12%,transparent)] text-[var(--success)]',
  MEDIUM: 'bg-[color-mix(in_srgb,var(--warning)_14%,transparent)] text-[var(--warning)]',
  HARD: 'bg-[color-mix(in_srgb,var(--danger)_12%,transparent)] text-[var(--danger)]',
};

const editOpen = ref(false);
const categoryOpen = ref(false);
const confirming = ref(false);
const form = reactive({ title: '', difficulty: 'EASY' as Difficulty, internalNote: '' });
const categoryIds = ref<string[]>([]);

/** 返回来源分类列表；无 categoryId 查询参数时回退到分类看板。 */
const backTo = computed(() => (typeof route.query.categoryId === 'string' ? `/categories/${route.query.categoryId}/problems` : '/categories'));
const createdAt = computed(() => problem.problem?.createdAt ? formatDate(problem.problem.createdAt) : '—');

const openEdit = (): void => { if (!problem.problem) return; Object.assign(form, { title: problem.problem.title, difficulty: problem.problem.difficulty, internalNote: problem.problem.internalNote ?? '' }); problem.saveError = ''; editOpen.value = true; };
const saveEdit = async (): Promise<void> => { if (await problem.update(problemId.value, { title: form.title.trim(), difficulty: form.difficulty, internalNote: form.internalNote.trim() || null })) editOpen.value = false; };
const toggleCategories = (): void => { if (!categoryOpen.value) categoryIds.value = problem.problem?.categories.map((item) => item.id) ?? []; categoryOpen.value = !categoryOpen.value; };
const saveCategories = async (): Promise<void> => { if (await problem.saveCategories(problemId.value, categoryIds.value)) categoryOpen.value = false; };
const saveNotes = async (noteIds: string[]): Promise<void> => { await problem.saveNotes(problemId.value, noteIds); };
const remove = async (): Promise<void> => { if (await problem.remove(problemId.value)) { confirming.value = false; void router.push(backTo.value); } };

const load = (): void => { void problem.fetch(problemId.value); void practice.fetch(problemId.value, 1); void management.fetchCategories(); void management.fetchNotes(); };
watch(problemId, (id) => { if (id) load(); });
onMounted(load);
</script>
<template>
  <section class="mx-auto flex w-full max-w-[1280px] flex-col">
    <p v-if="problem.loading" role="status" class="py-12 text-center text-sm text-[var(--color-text-muted)]">正在加载题目详情…</p>

    <div v-else-if="problem.error" class="flex min-h-[320px] flex-col items-center justify-center gap-3.5 rounded-[3px] border border-[var(--color-border)] bg-[var(--color-surface)] p-12 text-center">
      <div class="flex h-[54px] w-[54px] items-center justify-center rounded-[3px] bg-[color-mix(in_srgb,var(--danger)_12%,transparent)] text-[var(--danger)]">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-[26px] w-[26px]"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
      </div>
      <div class="text-[19px] font-semibold text-[var(--color-text)] [font-family:var(--font-heading)]">加载题目失败</div>
      <div class="max-w-[380px] text-[15px] leading-normal text-[var(--color-text-muted)]">{{ problem.error }}</div>
      <button class="inline-flex items-center gap-[6px] rounded-[3px] bg-[var(--color-accent)] px-3.5 py-2 text-[15px] font-medium leading-none text-white transition-colors hover:bg-[var(--color-accent-hover)]" @click="problem.fetch(problemId)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-[15px] w-[15px]"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
        重新加载
      </button>
    </div>

    <template v-else-if="problem.problem">
      <div class="mb-4 shrink-0">
        <RouterLink :to="backTo" class="mb-2 inline-flex items-center gap-[5px] text-[15px] font-medium text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-accent)]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="h-3.5 w-3.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          返回题目列表
        </RouterLink>
        <h1 class="text-[25px] font-bold tracking-tight text-[var(--color-text)] [font-family:var(--font-heading)]">{{ problem.problem.title }}</h1>
        <div class="mt-2 flex flex-wrap items-center gap-2 text-[17px] text-[var(--color-text-muted)]">
          <span class="inline-flex items-center rounded-[2px] px-[7px] text-[13px] font-semibold leading-[22px]" :class="DIFFICULTY_TAG[problem.problem.difficulty]">{{ DIFFICULTY_LABEL[problem.problem.difficulty] }}</span>
          <span v-for="category in problem.problem.categories" :key="category.id" class="inline-flex items-center rounded-[2px] bg-[var(--color-accent-light)] px-[7px] text-[13px] font-semibold leading-[22px] text-[var(--color-accent)]">{{ category.name }}</span>
          <span v-if="problem.problem.categories.length" class="h-[3px] w-[3px] shrink-0 rounded-full bg-[var(--color-text-muted)] opacity-70" />
          <span>创建于 {{ createdAt || '—' }}</span>
        </div>
      </div>

      <div class="grid items-start gap-2 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)]">
        <div class="flex min-w-0 flex-col gap-2">
          <div class="rounded-[3px] border border-[var(--color-border)] bg-[var(--color-surface)] p-3.5">
            <div class="mb-3 flex items-center gap-2">
              <span class="text-[17px] font-semibold text-[var(--color-text)] [font-family:var(--font-heading)]">内部笔记</span>
              <button class="ml-auto inline-flex items-center gap-[5px] text-[15px] font-medium text-[var(--color-accent)] transition-colors hover:text-[var(--color-accent-hover)]" @click="openEdit">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-3.5 w-3.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                编辑
              </button>
            </div>
            <p v-if="!problem.problem.internalNote" class="py-4 text-center text-[15px] text-[var(--color-text-muted)]">暂无内部笔记，点击「编辑」补充解题思路。</p>
            <div v-else class="text-base leading-[1.7] text-[var(--color-text-secondary)] [&_code]:rounded-[2px] [&_code]:bg-[var(--color-hover)] [&_code]:px-[5px] [&_code]:font-mono [&_code]:text-sm [&_h4]:mb-1.5 [&_h4]:mt-4 [&_h4]:text-[17px] [&_h4]:font-semibold [&_h4]:text-[var(--color-text)] [&_li]:mb-1 [&_p]:mb-1.5 [&_strong]:font-semibold [&_strong]:text-[var(--color-text)] [&_ul]:mb-2 [&_ul]:list-disc [&_ul]:pl-5" v-html="problem.problem.internalNote" />
          </div>

          <PracticeRecordList />
        </div>

        <div class="flex min-w-0 flex-col gap-2">
          <RelatedNotes :notes="problem.problem.notes" :options="management.notes" :saving="problem.saving" :error="problem.saveError" @save="saveNotes" />

          <div class="rounded-[3px] border border-[var(--color-border)] bg-[var(--color-surface)] p-3.5">
            <div class="mb-3 flex items-center gap-2">
              <span class="text-[17px] font-semibold text-[var(--color-text)] [font-family:var(--font-heading)]">操作</span>
            </div>
            <div class="flex flex-col gap-2">
              <button class="inline-flex w-full items-center justify-start gap-[6px] rounded-[3px] border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2 text-[15px] font-medium text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-hover)] hover:text-[var(--color-text)]" @click="openEdit">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-[15px] w-[15px]"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                编辑题目
              </button>
              <button class="inline-flex w-full items-center justify-start gap-[6px] rounded-[3px] border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2 text-[15px] font-medium text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-hover)] hover:text-[var(--color-text)]" @click="toggleCategories">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-[15px] w-[15px]"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
                管理分类
              </button>
              <button class="inline-flex w-full items-center justify-start gap-[6px] rounded-[3px] border border-[color-mix(in_srgb,var(--danger)_28%,var(--color-border))] bg-[color-mix(in_srgb,var(--danger)_8%,var(--color-surface))] px-3.5 py-2 text-[15px] font-medium text-[var(--danger)] transition-colors hover:bg-[color-mix(in_srgb,var(--danger)_16%,transparent)]" @click="confirming = true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-[15px] w-[15px]"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                删除题目
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="editOpen" class="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4" @click.self="editOpen = false">
        <form class="w-full max-w-md space-y-4 rounded-[3px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5" @submit.prevent="saveEdit">
          <h3 class="text-xl font-semibold text-[var(--color-text)] [font-family:var(--font-heading)]">编辑题目</h3>
          <label class="block text-[15px] text-[var(--color-text-secondary)]">
            题目标题
            <input v-model="form.title" required maxlength="255" aria-label="题目标题" class="mt-1 w-full rounded-[3px] border border-[var(--color-border)] bg-transparent px-3 py-2 text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]" />
          </label>
          <label class="block text-[15px] text-[var(--color-text-secondary)]">
            难度
            <select v-model="form.difficulty" aria-label="题目难度" class="mt-1 w-full rounded-[3px] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]">
              <option value="EASY">简单</option>
              <option value="MEDIUM">中等</option>
              <option value="HARD">困难</option>
            </select>
          </label>
          <label class="block text-[15px] text-[var(--color-text-secondary)]">
            内部笔记
            <textarea v-model="form.internalNote" rows="5" aria-label="内部笔记" placeholder="支持 HTML 片段" class="mt-1 w-full rounded-[3px] border border-[var(--color-border)] bg-transparent px-3 py-2 text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]" />
          </label>
          <p v-if="problem.saveError" role="alert" class="text-sm text-[var(--danger)]">{{ problem.saveError }}</p>
          <div class="flex justify-end gap-3">
            <button type="button" class="rounded-[3px] border border-[var(--color-border)] px-4 py-2 text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-hover)]" @click="editOpen = false">取消</button>
            <button :disabled="problem.saving || !form.title.trim()" type="submit" class="rounded-[3px] bg-[var(--color-accent)] px-4 py-2 font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)] disabled:opacity-50">{{ problem.saving ? '保存中…' : '保存' }}</button>
          </div>
        </form>
      </div>

      <div v-if="categoryOpen" class="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4" @click.self="categoryOpen = false">
        <div class="w-full max-w-md space-y-4 rounded-[3px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <h3 class="text-xl font-semibold text-[var(--color-text)] [font-family:var(--font-heading)]">管理分类</h3>
          <p v-if="!management.categories.length" class="text-sm text-[var(--color-text-muted)]">暂无分类，请先到「刷题练习」页创建分类。</p>
          <div class="max-h-64 space-y-2 overflow-y-auto">
            <label v-for="category in management.categories" :key="category.id" class="flex items-center gap-2 text-[15px] text-[var(--color-text-secondary)]">
              <input type="checkbox" class="accent-[var(--color-accent)]" :checked="categoryIds.includes(category.id)" @change="categoryIds = ($event.target as HTMLInputElement).checked ? [...new Set([...categoryIds, category.id])] : categoryIds.filter((item) => item !== category.id)" />
              {{ category.name }}
            </label>
          </div>
          <p v-if="management.categoryError" role="alert" class="text-sm text-[var(--danger)]">{{ management.categoryError }}</p>
          <div class="flex justify-end gap-3">
            <button type="button" class="rounded-[3px] border border-[var(--color-border)] px-4 py-2 text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-hover)]" @click="categoryOpen = false">取消</button>
            <button :disabled="problem.saving" class="rounded-[3px] bg-[var(--color-accent)] px-4 py-2 font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)] disabled:opacity-50" @click="saveCategories">{{ problem.saving ? '保存中…' : '保存分类' }}</button>
          </div>
        </div>
      </div>

      <div v-if="confirming" class="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4" @click.self="confirming = false">
        <div class="w-full max-w-sm space-y-4 rounded-[3px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <h3 class="text-xl font-semibold text-[var(--color-text)] [font-family:var(--font-heading)]">删除题目</h3>
          <p class="text-[15px] leading-relaxed text-[var(--color-text-secondary)]">确认删除「{{ problem.problem.title }}」吗？练习记录与关联笔记会一并解除，此操作不可撤销。</p>
          <p v-if="problem.deleteError" role="alert" class="text-sm text-[var(--danger)]">{{ problem.deleteError }}</p>
          <div class="flex justify-end gap-3">
            <button type="button" class="rounded-[3px] border border-[var(--color-border)] px-4 py-2 text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-hover)]" @click="confirming = false">取消</button>
            <button :disabled="problem.deleting" class="rounded-[3px] bg-[var(--danger)] px-4 py-2 font-medium text-white transition-opacity disabled:opacity-50" @click="remove">{{ problem.deleting ? '删除中…' : '确认删除' }}</button>
          </div>
        </div>
      </div>
    </template>
  </section>
</template>
