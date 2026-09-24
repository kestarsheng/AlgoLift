<!-- 分类题目列表：按 prototype/problem-list.html 移植，数据来自 GET /api/categories/:categoryId/problems。 -->
<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useProblemListStore } from '../stores/problemList';
import ProblemRow from '../components/problem/ProblemRow.vue';
import type { Difficulty, ProblemListItem } from '../types';

const route = useRoute();
const router = useRouter();
const store = useProblemListStore();
const categoryId = computed(() => String(route.params.categoryId ?? ''));

const DIFFICULTIES: { value: Difficulty | ''; label: string }[] = [
  { value: '', label: '全部' },
  { value: 'EASY', label: '简单' },
  { value: 'MEDIUM', label: '中等' },
  { value: 'HARD', label: '困难' },
];

const formOpen = ref(false);
const form = reactive({ title: '', difficulty: 'EASY' as Difficulty });

/** 当前页展示的序号区间，如「1–10」。 */
const rangeLabel = computed(() => {
  const { page, pageSize, total } = store.pagination;
  if (!total) return '0';
  return `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, total)}`;
});
/** 原型式页码列表：始终显示首尾页，当前页两侧各留一页，其余折叠为省略号。 */
const pageItems = computed<(number | '…')[]>(() => {
  const { page, totalPages } = store.pagination;
  const pages = new Set<number>([1, totalPages, page, page - 1, page + 1]);
  const sorted = [...pages].filter((n) => n >= 1 && n <= totalPages).sort((a, b) => a - b);
  const result: (number | '…')[] = [];
  let previous = 0;
  for (const n of sorted) { if (previous && n - previous > 1) result.push('…'); result.push(n); previous = n; }
  return result;
});

const openCreate = (): void => { form.title = ''; form.difficulty = 'EASY'; store.saveError = ''; formOpen.value = true; };
/** 新建题目后直接进入详情，便于继续补充笔记与分类。 */
const save = async (): Promise<void> => {
  const problem = await store.create({ title: form.title, difficulty: form.difficulty, categoryIds: store.categoryId ? [store.categoryId] : [] });
  if (problem) { formOpen.value = false; void router.push(`/problems/${problem.id}?categoryId=${store.categoryId}`); }
};
const openProblem = (problem: ProblemListItem): void => { void router.push(`/problems/${problem.id}?categoryId=${store.categoryId}`); };

// 路由参数变化（切换分类）时回到第 1 页并重新加载。
watch(categoryId, (id) => { store.pagination.page = 1; store.keyword = ''; store.difficulty = ''; void store.fetch(id); void store.fetchCategoryName(); });
onMounted(() => { store.pagination.page = 1; void store.fetch(categoryId.value); void store.fetchCategoryName(); });
</script>
<template>
  <section class="mx-auto flex w-full max-w-[1280px] flex-col">
    <header class="mb-3.5 shrink-0">
      <RouterLink to="/categories" class="mb-2 inline-flex items-center gap-1 text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-accent)]">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-[15px] w-[15px]"><polyline points="15 18 9 12 15 6"/></svg>
        返回分类看板
      </RouterLink>
      <div class="flex flex-col items-start justify-between gap-4 sm:flex-row">
        <div>
          <h1 class="text-[25px] font-bold tracking-tight text-[var(--color-text)] [font-family:var(--font-heading)]">{{ store.categoryName || '题目列表' }}{{ store.categoryName ? ' · 题目列表' : '' }}</h1>
          <div class="mt-0.5 flex items-center gap-2 text-[17px] text-[var(--color-text-muted)]">
            共 <span class="font-semibold text-[var(--color-text)]">{{ store.pagination.total }}</span> 题 · 本页已练习 <span class="font-semibold text-[var(--color-text)]">{{ store.practicedCount }}</span> 题
          </div>
        </div>
        <div v-if="!store.loading && !store.error" class="flex shrink-0 items-center gap-2">
          <button class="inline-flex items-center gap-[6px] whitespace-nowrap rounded-[3px] bg-[var(--color-accent)] px-3.5 py-2 text-[15px] font-medium leading-none text-white transition-colors hover:bg-[var(--color-accent-hover)]" @click="openCreate">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="h-[15px] w-[15px]"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            新增题目
          </button>
        </div>
      </div>
    </header>

    <form v-if="!store.error" class="mb-3 flex flex-wrap items-center gap-2.5" @submit.prevent="store.search">
      <div class="relative min-w-[220px] flex-1 sm:max-w-[360px]">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="pointer-events-none absolute left-[11px] top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-[var(--color-text-muted)]"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input v-model="store.keyword" aria-label="搜索题目" placeholder="搜索题目…" class="w-full rounded-[3px] border border-[var(--color-border)] bg-[var(--color-surface)] py-2 pl-[34px] pr-3 text-[15px] text-[var(--color-text)] outline-none transition-colors placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent)]" />
      </div>
      <div class="inline-flex items-center gap-0.5 rounded-[3px] border border-[var(--color-border)] bg-[var(--color-surface)] p-0.5" role="group" aria-label="难度筛选">
        <button v-for="item in DIFFICULTIES" :key="item.value" type="button" class="rounded-[2px] px-[11px] py-[5px] text-sm font-medium transition-colors" :class="store.difficulty === item.value ? 'bg-[var(--color-accent-light)] font-semibold text-[var(--color-accent)]' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-hover)] hover:text-[var(--color-text)]'" :aria-pressed="store.difficulty === item.value" @click="store.setDifficulty(item.value)">{{ item.label }}</button>
      </div>
      <button type="submit" class="rounded-[3px] border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2 text-sm font-medium text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-hover)] hover:text-[var(--color-text)]">筛选</button>
      <div class="text-sm text-[var(--color-text-muted)] sm:ml-auto">显示第 <b class="font-mono font-semibold text-[var(--color-text)]">{{ rangeLabel }}</b> / 共 <b class="font-mono font-semibold text-[var(--color-text)]">{{ store.pagination.total }}</b> 题</div>
    </form>

    <p v-if="store.loading" role="status" class="sr-only">正在加载题目…</p>
    <div v-if="store.loading" class="overflow-hidden rounded-[3px] border border-[var(--color-border)] bg-[var(--color-surface)]" aria-hidden="true">
      <div v-for="n in 10" :key="n" class="grid animate-pulse grid-cols-[26px_1fr_64px_84px_22px] items-center gap-2 border-b border-[var(--color-border)] px-3.5 py-[11px] last:border-b-0 sm:grid-cols-[34px_1fr_72px_84px_60px_104px_22px] sm:gap-2.5">
        <div class="h-3.5 w-[18px] justify-self-end rounded-[2px] bg-[var(--color-hover)]" />
        <div class="h-3.5 w-[62%] rounded-[2px] bg-[var(--color-hover)]" />
        <div class="h-3.5 w-12 justify-self-start rounded-[2px] bg-[var(--color-hover)] sm:w-[48px]" />
        <div class="hidden h-3.5 w-[34px] justify-self-end rounded-[2px] bg-[var(--color-hover)] sm:block" />
        <div class="hidden h-3.5 w-[34px] justify-self-end rounded-[2px] bg-[var(--color-hover)] sm:block" />
        <div class="h-3.5 w-16 justify-self-end rounded-[2px] bg-[var(--color-hover)]" />
        <div />
      </div>
    </div>

    <div v-else-if="store.error" class="flex min-h-[320px] flex-col items-center justify-center gap-3.5 rounded-[3px] border border-[var(--color-border)] bg-[var(--color-surface)] p-12 text-center">
      <div class="flex h-[54px] w-[54px] items-center justify-center rounded-[3px] bg-[color-mix(in_srgb,var(--danger)_12%,transparent)] text-[var(--danger)]">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-[26px] w-[26px]"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
      </div>
      <div class="text-[19px] font-semibold text-[var(--color-text)] [font-family:var(--font-heading)]">加载题目失败</div>
      <div class="max-w-[380px] text-[15px] leading-normal text-[var(--color-text-muted)]">{{ store.error }}</div>
      <button class="inline-flex items-center gap-[6px] rounded-[3px] bg-[var(--color-accent)] px-3.5 py-2 text-[15px] font-medium leading-none text-white transition-colors hover:bg-[var(--color-accent-hover)]" @click="store.fetch(categoryId)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-[15px] w-[15px]"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
        重新加载
      </button>
    </div>

    <div v-else-if="!store.items.length" class="flex min-h-[320px] flex-col items-center justify-center gap-3.5 rounded-[3px] border border-[var(--color-border)] bg-[var(--color-surface)] p-12 text-center">
      <div class="flex h-[54px] w-[54px] items-center justify-center rounded-[3px] bg-[var(--color-hover)] text-[var(--color-text-muted)]">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="h-[26px] w-[26px]"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="13" y2="17"/></svg>
      </div>
      <div class="text-[19px] font-semibold text-[var(--color-text)] [font-family:var(--font-heading)]">{{ store.keyword || store.difficulty ? '没有匹配的题目' : '该分类下还没有题目' }}</div>
      <div class="max-w-[380px] text-[15px] leading-normal text-[var(--color-text-muted)]">{{ store.keyword || store.difficulty ? '换个关键词或调整难度筛选后再试。' : `「${store.categoryName || '当前分类'}」下暂无题目，新增第一道题目开始系统化练习吧。` }}</div>
      <button class="inline-flex items-center gap-[6px] rounded-[3px] bg-[var(--color-accent)] px-3.5 py-2 text-[15px] font-medium leading-none text-white transition-colors hover:bg-[var(--color-accent-hover)]" @click="openCreate">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="h-[15px] w-[15px]"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        新增题目
      </button>
    </div>

    <template v-else>
      <div class="overflow-hidden rounded-[3px] border border-[var(--color-border)] bg-[var(--color-surface)]">
        <div class="grid grid-cols-[26px_1fr_64px_84px_22px] items-center gap-2 border-b border-[var(--color-border)] px-3.5 py-[11px] sm:grid-cols-[34px_1fr_72px_84px_60px_104px_22px] sm:gap-2.5">
          <div class="text-right text-xs font-semibold uppercase tracking-[0.05em] text-[var(--color-text-muted)]">#</div>
          <div class="text-xs font-semibold uppercase tracking-[0.05em] text-[var(--color-text-muted)]">题目标题</div>
          <div class="text-center text-xs font-semibold uppercase tracking-[0.05em] text-[var(--color-text-muted)]">难度</div>
          <div class="hidden text-right text-xs font-semibold uppercase tracking-[0.05em] text-[var(--color-text-muted)] sm:block">练习次数</div>
          <div class="hidden text-right text-xs font-semibold uppercase tracking-[0.05em] text-[var(--color-text-muted)] sm:block">笔记</div>
          <div class="text-right text-xs font-semibold uppercase tracking-[0.05em] text-[var(--color-text-muted)]">最近练习</div>
          <div />
        </div>
        <ProblemRow v-for="(problem, i) in store.items" :key="problem.id" :problem="problem" :index="(store.pagination.page - 1) * store.pagination.pageSize + i + 1" @open="openProblem" />
      </div>

      <nav v-if="store.pagination.totalPages > 1" class="mt-3.5 flex flex-wrap items-center justify-center gap-1" aria-label="分页">
        <button class="flex h-8 min-w-8 items-center justify-center rounded-[3px] border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-hover)] disabled:cursor-not-allowed disabled:opacity-40" :disabled="store.pagination.page <= 1" title="上一页" aria-label="上一页" @click="store.setPage(store.pagination.page - 1)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-[15px] w-[15px]"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <template v-for="(item, i) in pageItems" :key="`${item}-${i}`">
          <span v-if="item === '…'" class="px-1 font-mono text-sm text-[var(--color-text-muted)]">…</span>
          <button v-else class="h-8 min-w-8 rounded-[3px] border px-2 font-mono text-sm font-medium transition-colors" :class="item === store.pagination.page ? 'border-[var(--color-accent-light)] bg-[var(--color-accent-light)] font-bold text-[var(--color-accent)]' : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:bg-[var(--color-hover)] hover:text-[var(--color-text)]'" :aria-current="item === store.pagination.page ? 'page' : undefined" @click="store.setPage(item)">{{ item }}</button>
        </template>
        <button class="flex h-8 min-w-8 items-center justify-center rounded-[3px] border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-hover)] disabled:cursor-not-allowed disabled:opacity-40" :disabled="store.pagination.page >= store.pagination.totalPages" title="下一页" aria-label="下一页" @click="store.setPage(store.pagination.page + 1)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-[15px] w-[15px]"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </nav>
    </template>

    <div v-if="formOpen" class="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4" @click.self="formOpen = false">
      <form class="w-full max-w-md space-y-4 rounded-[3px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5" @submit.prevent="save">
        <h3 class="text-xl font-semibold text-[var(--color-text)] [font-family:var(--font-heading)]">新增题目</h3>
        <label class="block text-[15px] text-[var(--color-text-secondary)]">
          题目标题
          <input v-model="form.title" required maxlength="255" aria-label="题目标题" placeholder="例如：Two Sum" class="mt-1 w-full rounded-[3px] border border-[var(--color-border)] bg-transparent px-3 py-2 text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]" />
        </label>
        <label class="block text-[15px] text-[var(--color-text-secondary)]">
          难度
          <select v-model="form.difficulty" aria-label="题目难度" class="mt-1 w-full rounded-[3px] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]">
            <option value="EASY">简单</option>
            <option value="MEDIUM">中等</option>
            <option value="HARD">困难</option>
          </select>
        </label>
        <p v-if="store.saveError" role="alert" class="text-sm text-[var(--danger)]">{{ store.saveError }}</p>
        <div class="flex justify-end gap-3">
          <button type="button" class="rounded-[3px] border border-[var(--color-border)] px-4 py-2 text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-hover)]" @click="formOpen = false">取消</button>
          <button :disabled="store.saving || !form.title.trim()" type="submit" class="rounded-[3px] bg-[var(--color-accent)] px-4 py-2 font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)] disabled:opacity-50">{{ store.saving ? '保存中…' : '保存' }}</button>
        </div>
      </form>
    </div>
  </section>
</template>
