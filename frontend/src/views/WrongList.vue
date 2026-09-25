<!-- 错题本列表：按 prototype/wrong-list.html 移植，服务器端筛选+分页，支持新建错题。 -->
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { useWrongListStore } from '../stores/wrongList';
import PaginationNav from '../components/PaginationNav.vue';
import StateBox from '../components/StateBox.vue';
import Modal from '../components/Modal.vue';
import { WRONG_CATEGORY_PRESETS } from '../constants';
import type { Difficulty, WrongListItem } from '../types';

const store = useWrongListStore();

const difficultyOptions: { key: Difficulty | ''; label: string }[] = [
  { key: '', label: '全部' },
  { key: 'EASY', label: '简单' },
  { key: 'MEDIUM', label: '中等' },
  { key: 'HARD', label: '困难' },
];
const diffLabel: Record<Difficulty, string> = { EASY: '简单', MEDIUM: '中等', HARD: '困难' };
const diffTagClass: Record<Difficulty, string> = {
  EASY: 'bg-[color-mix(in_srgb,var(--success)_14%,transparent)] text-[var(--success)]',
  MEDIUM: 'bg-[color-mix(in_srgb,var(--warning)_18%,transparent)] text-[var(--warning)]',
  HARD: 'bg-[color-mix(in_srgb,var(--danger)_14%,transparent)] text-[var(--danger)]',
};

const categories = computed<string[]>(() => [...new Set(store.items.map((item) => item.category).filter((category): category is string => Boolean(category)))]);
const filtered = computed(() => Boolean(store.keyword || store.category || store.difficulty));
const rangeLabel = computed(() => {
  const { total, page, pageSize } = store.pagination;
  if (total === 0) return '共 0 条';
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  return `显示第 ${from}–${to} / 共 ${total} 条`;
});
const linkCount = (item: WrongListItem): number => Array.isArray(item.solutionLinks) ? item.solutionLinks.length : 0;
function relativeTime(iso: string | undefined): string {
  if (!iso) return '—';
  const then = new Date(iso);
  const now = new Date();
  const days = Math.floor((now.getTime() - then.getTime()) / 86400000);
  if (days <= 0) return '今天';
  if (days === 1) return '昨天';
  if (days < 7) return `${days} 天前`;
  if (days < 30) return `${Math.floor(days / 7)} 周前`;
  return `${then.getFullYear()}-${String(then.getMonth() + 1).padStart(2, '0')}-${String(then.getDate()).padStart(2, '0')}`;
}

const formOpen = ref(false);
const form = ref({ title: '', category: '', difficulty: 'EASY' as Difficulty });
function openCreate(): void { form.value = { title: '', category: '', difficulty: 'EASY' }; store.saveError = ''; formOpen.value = true; }
async function save(): Promise<void> { if (!form.value.title.trim() || store.saving) return; const wrong = await store.create({ ...form.value }); if (wrong) formOpen.value = false; }

onMounted(() => { void store.fetch(); });
</script>
<template>
  <section class="mx-auto flex w-full max-w-[1280px] flex-col">
    <header class="mb-3.5 flex shrink-0 flex-col items-start justify-between gap-4 sm:flex-row">
      <div>
        <h1 class="text-[25px] font-bold tracking-tight text-[var(--color-text)] [font-family:var(--font-heading)]">错题本</h1>
        <div class="mt-0.5 flex items-center gap-2 text-[17px] text-[var(--color-text-muted)]">共 <span class="font-semibold text-[var(--color-text)]">{{ store.pagination.total }}</span> 道错题</div>
      </div>
      <div v-if="!store.loading && !store.error" class="flex shrink-0 items-center gap-2">
        <button class="inline-flex items-center gap-[6px] whitespace-nowrap rounded-[3px] bg-[var(--color-accent)] px-3.5 py-2 text-[15px] font-medium leading-none text-white transition-colors hover:bg-[var(--color-accent-hover)]" @click="openCreate">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="h-[15px] w-[15px]"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          新建错题
        </button>
      </div>
    </header>

    <div v-if="!store.error" class="mb-3 flex shrink-0 flex-wrap items-center gap-2.5">
      <div class="relative min-w-[200px] max-w-[320px] flex-1">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="pointer-events-none absolute top-1/2 left-[11px] h-[15px] w-[15px] -translate-y-1/2 text-[var(--color-text-muted)]"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input v-model="store.keyword" aria-label="关键词" class="w-full rounded-[3px] border border-[var(--color-border)] bg-[var(--color-surface)] py-2 pr-3 pl-[34px] font-inherit text-[15px] text-[var(--color-text)] transition-colors placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent)] focus:outline-none" placeholder="搜索错题标题或分类…" @input="void store.search()" />
      </div>
      <div class="relative min-w-[132px]">
        <select v-model="store.category" aria-label="分类" class="w-full cursor-pointer appearance-none rounded-[3px] border border-[var(--color-border)] bg-[var(--color-surface)] py-2 pr-8 pl-3 font-inherit text-[15px] text-[var(--color-text)] transition-colors focus:border-[var(--color-accent)] focus:outline-none" @change="void store.search()">
          <option value="">全部分类</option>
          <option v-for="category in categories" :key="category" :value="category">{{ category }}</option>
        </select>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="pointer-events-none absolute top-1/2 right-2.5 h-[14px] w-[14px] -translate-y-1/2 text-[var(--color-text-muted)]"><polyline points="6 9 12 15 18 9"/></svg>
      </div>
      <div class="inline-flex items-center gap-[2px] rounded-[3px] border border-[var(--color-border)] bg-[var(--color-surface)] p-[2px]">
        <button v-for="option in difficultyOptions" :key="option.key || 'all'" :class="store.difficulty === option.key ? 'bg-[var(--color-accent-light)] font-semibold text-[var(--color-accent)]' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-hover)] hover:text-[var(--color-text)]'" class="cursor-pointer rounded-[2px] border-none bg-transparent px-[11px] py-[5px] font-inherit text-sm font-medium transition-colors" @click="store.difficulty = option.key; void store.search()">{{ option.label }}</button>
      </div>
      <span class="ml-auto text-sm text-[var(--color-text-muted)]"><b class="font-mono font-semibold text-[var(--color-text)]">{{ store.pagination.total }}</b> 条结果</span>
    </div>

    <p v-if="store.loading" role="status" class="sr-only">正在加载错题…</p>
    <div v-if="store.loading" aria-hidden="true" class="overflow-hidden rounded-[3px] border border-[var(--color-border)] bg-[var(--color-surface)]">
      <div class="grid grid-cols-[26px_minmax(0,1fr)_64px_84px_22px] items-center gap-2 border-b border-[var(--color-border)] px-3.5 py-3 lg:grid-cols-[34px_minmax(0,1fr)_72px_96px_56px_56px_104px_22px]">
        <span class="text-right font-mono text-xs font-semibold tracking-[0.05em] text-[var(--color-text-muted)] uppercase">#</span>
        <span class="text-xs font-semibold tracking-[0.05em] text-[var(--color-text-muted)] uppercase">错题标题</span>
        <span class="hidden text-center text-xs font-semibold tracking-[0.05em] text-[var(--color-text-muted)] uppercase lg:block">难度</span>
        <span class="hidden text-xs font-semibold tracking-[0.05em] text-[var(--color-text-muted)] uppercase lg:block">分类</span>
        <span class="hidden text-right text-xs font-semibold tracking-[0.05em] text-[var(--color-text-muted)] uppercase lg:block">题解</span>
        <span class="hidden text-right text-xs font-semibold tracking-[0.05em] text-[var(--color-text-muted)] uppercase lg:block">最近复习</span>
        <span />
      </div>
      <div v-for="n in 8" :key="n" class="flex animate-pulse items-center gap-2.5 border-b border-[var(--color-border)] px-3.5 py-[11px] last:border-b-0">
        <div class="h-[13px] w-[18px] rounded-[2px] bg-[var(--color-hover)]" />
        <div class="h-[13px] w-1/2 rounded-[2px] bg-[var(--color-hover)]" />
        <div class="hidden h-[13px] w-12 rounded-[2px] bg-[var(--color-hover)] lg:block" />
        <div class="hidden h-[13px] w-14 rounded-[2px] bg-[var(--color-hover)] lg:block" />
        <div class="h-[13px] w-8 rounded-[2px] bg-[var(--color-hover)]" />
        <div class="flex-1" />
      </div>
    </div>

    <StateBox v-else-if="store.error" kind="error" title="加载错题失败" :desc="store.error">
      <template #icon><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-[26px] w-[26px]"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></template>
      <button class="inline-flex items-center gap-[6px] rounded-[3px] bg-[var(--color-accent)] px-3.5 py-2 text-[15px] font-medium leading-none text-white transition-colors hover:bg-[var(--color-accent-hover)]" @click="store.fetch">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-[15px] w-[15px]"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
        重新加载
      </button>
    </StateBox>

    <StateBox v-else-if="!store.items.length" :title="filtered ? '没有符合条件的错题' : '还没有错题'" :desc="filtered ? '试试调整关键词、分类或难度筛选，看看其他题目。' : '把练习中做错的题目记进错题本，复盘错因、附上题解，下次复习时逐个击破。'">
      <template #icon><svg v-if="filtered" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-[26px] w-[26px]"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg><svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="h-[26px] w-[26px]"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="13" y2="17"/></svg></template>
      <button v-if="!filtered" class="inline-flex items-center gap-[6px] rounded-[3px] bg-[var(--color-accent)] px-3.5 py-2 text-[15px] font-medium leading-none text-white transition-colors hover:bg-[var(--color-accent-hover)]" @click="openCreate">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="h-[15px] w-[15px]"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        新建错题
      </button>
    </StateBox>

    <template v-else>
      <div class="overflow-hidden rounded-[3px] border border-[var(--color-border)] bg-[var(--color-surface)]">
        <div class="grid grid-cols-[26px_minmax(0,1fr)_64px_84px_22px] items-center gap-2 border-b border-[var(--color-border)] px-3.5 py-3 lg:grid-cols-[34px_minmax(0,1fr)_72px_96px_56px_56px_104px_22px]">
          <span class="text-right font-mono text-xs font-semibold tracking-[0.05em] text-[var(--color-text-muted)] uppercase">#</span>
          <span class="text-xs font-semibold tracking-[0.05em] text-[var(--color-text-muted)] uppercase">错题标题</span>
          <span class="hidden text-center text-xs font-semibold tracking-[0.05em] text-[var(--color-text-muted)] uppercase lg:block">难度</span>
          <span class="hidden text-xs font-semibold tracking-[0.05em] text-[var(--color-text-muted)] uppercase lg:block">分类</span>
          <span class="hidden text-right text-xs font-semibold tracking-[0.05em] text-[var(--color-text-muted)] uppercase lg:block">题解</span>
          <span class="hidden text-right text-xs font-semibold tracking-[0.05em] text-[var(--color-text-muted)] uppercase lg:block">最近复习</span>
          <span />
        </div>
        <RouterLink v-for="(wrong, index) in store.items" :key="wrong.id" :to="`/wrongs/${wrong.id}`" class="group grid grid-cols-[26px_minmax(0,1fr)_64px_84px_22px] items-center gap-2 border-b border-[var(--color-border)] px-3.5 py-[11px] transition-colors last:border-b-0 hover:bg-[var(--color-hover)] lg:grid-cols-[34px_minmax(0,1fr)_72px_96px_56px_56px_104px_22px]">
          <span class="font-mono text-[13px] text-right text-[var(--color-text-muted)]">{{ (store.pagination.page - 1) * store.pagination.pageSize + index + 1 }}</span>
          <span class="truncate text-base font-medium text-[var(--color-text)] transition-colors group-hover:text-[var(--color-accent)]">{{ wrong.title }}</span>
          <span class="hidden text-center lg:block"><span class="inline-flex min-w-12 items-center justify-center rounded-[3px] px-[9px] py-[2px] text-xs font-semibold leading-[18px]" :class="diffTagClass[wrong.difficulty]">{{ diffLabel[wrong.difficulty] }}</span></span>
          <span class="hidden lg:block"><span class="inline-flex max-w-full items-center justify-center truncate rounded-[3px] bg-[var(--color-hover)] px-2 py-[2px] text-xs font-semibold text-[var(--color-text-secondary)]">{{ wrong.category || '—' }}</span></span>
          <span class="font-mono text-right text-[15px] font-semibold text-[var(--color-text)]">{{ linkCount(wrong) }}</span>
          <span class="hidden text-right text-sm whitespace-nowrap text-[var(--color-text-muted)] lg:block">{{ relativeTime(wrong.updatedAt) }}</span>
          <span class="ml-auto flex items-center justify-center text-[var(--color-text-muted)] opacity-0 transition-opacity group-hover:opacity-100">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-[15px] w-[15px] group-hover:text-[var(--color-accent)]"><polyline points="9 18 15 12 9 6"/></svg>
          </span>
        </RouterLink>
      </div>
      <span class="mt-3 text-right text-sm text-[var(--color-text-muted)]">{{ rangeLabel }}</span>
      <PaginationNav class="mb-4" :page="store.pagination.page" :total-pages="store.pagination.totalPages" @page="store.setPage" />
    </template>

    <Modal :open="formOpen" title="新建错题" @close="formOpen = false">
      <form class="space-y-4" @submit.prevent="save">
        <label class="block text-[15px] font-medium text-[var(--color-text-secondary)]">
          错题标题
          <input v-model="form.title" aria-label="错题标题" required maxlength="255" class="mt-1 w-full rounded-[3px] border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-[15px] text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none" />
        </label>
        <label class="block text-[15px] font-medium text-[var(--color-text-secondary)]">
          分类（自由文本）
          <input v-model="form.category" aria-label="错题分类" list="wrong-category-presets" maxlength="100" class="mt-1 w-full rounded-[3px] border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-[15px] text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none" />
          <datalist id="wrong-category-presets"><option v-for="preset in WRONG_CATEGORY_PRESETS" :key="preset" :value="preset" /></datalist>
        </label>
        <label class="block text-[15px] font-medium text-[var(--color-text-secondary)]">
          难度
          <select v-model="form.difficulty" aria-label="错题难度" class="mt-1 w-full rounded-[3px] border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-[15px] text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none">
            <option value="EASY">简单</option><option value="MEDIUM">中等</option><option value="HARD">困难</option>
          </select>
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