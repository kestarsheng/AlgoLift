<!-- 待办列表：按 prototype/todo-list.html 移植，状态/优先级/逾期筛选 + 分页 + 完整 CRUD。 -->
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useTodoStore } from '../stores/todo';
import PaginationNav from '../components/PaginationNav.vue';
import StateBox from '../components/StateBox.vue';
import Modal from '../components/Modal.vue';
import { formatDate } from '../utils/date';
import type { Todo, TodoPriority, TodoStatus } from '../types';

const store = useTodoStore();

const statusOptions: { key: TodoStatus | ''; label: string }[] = [
  { key: '', label: '全部' },
  { key: 'TODO', label: '待办' },
  { key: 'IN_PROGRESS', label: '进行中' },
  { key: 'COMPLETED', label: '已完成' },
];
const priorityOptions: { key: TodoPriority | ''; label: string }[] = [
  { key: '', label: '全部' },
  { key: 'P0', label: 'P0' },
  { key: 'P1', label: 'P1' },
  { key: 'P2', label: 'P2' },
];
const statusLabel: Record<TodoStatus, string> = { TODO: '待办', IN_PROGRESS: '进行中', COMPLETED: '已完成' };
const priTagClass: Record<TodoPriority, string> = {
  P0: 'bg-[color-mix(in_srgb,var(--danger)_14%,transparent)] text-[var(--danger)]',
  P1: 'bg-[color-mix(in_srgb,var(--warning)_18%,transparent)] text-[var(--warning)]',
  P2: 'bg-[var(--color-hover)] text-[var(--color-text-muted)]',
};
const stTagClass: Record<TodoStatus, string> = {
  TODO: 'bg-[var(--color-accent-light)] text-[var(--color-accent)]',
  IN_PROGRESS: 'bg-[color-mix(in_srgb,var(--warning)_18%,transparent)] text-[var(--warning)]',
  COMPLETED: 'bg-[color-mix(in_srgb,var(--success)_14%,transparent)] text-[var(--success)]',
};

const rangeLabel = computed(() => {
  const { total, page, pageSize } = store.pagination;
  if (total === 0) return '共 0 项';
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  return `显示第 ${from}–${to} / 共 ${total} 项`;
});
function dueParts(todo: Todo): { date: string; label: string; overdue: boolean } {
  if (!todo.dueDate) return { date: '未设置', label: '', overdue: false };
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const then = new Date(`${formatDate(todo.dueDate)}T00:00:00`);
  const diff = Math.round((then.getTime() - today.getTime()) / 86400000);
  const date = formatDate(todo.dueDate).slice(5);
  if (todo.isOverdue) return { date, label: '已逾期', overdue: true };
  if (diff === 0) return { date, label: '今天', overdue: false };
  if (diff === 1) return { date, label: '明天', overdue: false };
  if (diff === 2) return { date, label: '后天', overdue: false };
  if (diff < 7) return { date, label: '本周', overdue: false };
  return { date, label: '', overdue: false };
}

const editing = ref<Todo | null>(null);
const formOpen = ref(false);
const form = ref({ title: '', dueDate: '', priority: 'P1' as TodoPriority, status: 'TODO' as TodoStatus, remark: '' });
function openCreate(): void { editing.value = null; form.value = { title: '', dueDate: '', priority: 'P1', status: 'TODO', remark: '' }; store.saveError = ''; formOpen.value = true; }
async function openEdit(todo: Todo): Promise<void> { const current = await store.get(todo.id); if (current) { editing.value = current; form.value = { title: current.title, dueDate: current.dueDate?.slice(0, 10) ?? '', priority: current.priority, status: current.status, remark: current.remark ?? '' }; formOpen.value = true; } }
async function save(): Promise<void> { if (!form.value.title.trim() || store.saving) return; const input = { ...form.value, title: form.value.title.trim(), dueDate: form.value.dueDate || undefined, remark: form.value.remark || undefined }; const result = editing.value ? await store.update(editing.value.id, input) : await store.create(input); if (result) { formOpen.value = false; void store.fetchSummaries(); } }
async function toggle(todo: Todo): Promise<void> { await store.toggle(todo); void store.fetchSummaries(); }
async function remove(todo: Todo): Promise<void> { if (window.confirm(`确定删除“${todo.title}”吗？`)) { const ok = await store.remove(todo.id); if (ok) void store.fetchSummaries(); } }

onMounted(() => { void store.fetch(); void store.fetchSummaries(); });
</script>
<template>
  <section class="mx-auto flex w-full max-w-[1280px] flex-col">
    <header class="mb-3.5 flex shrink-0 flex-col items-start justify-between gap-4 sm:flex-row">
      <div>
        <h1 class="text-[25px] font-bold tracking-tight text-[var(--color-text)] [font-family:var(--font-heading)]">待办</h1>
        <div class="mt-0.5 flex items-center gap-2 text-[17px] text-[var(--color-text-muted)]">
          共 <span class="font-semibold text-[var(--color-text)]">{{ store.totalCount }}</span> 项 · 未完成 <span class="font-semibold text-[var(--color-text)]">{{ store.incompleteCount }}</span> 项 · <span :class="store.overdueCount > 0 ? 'font-semibold text-[var(--danger)]' : ''">{{ store.overdueCount }} 项逾期</span>
        </div>
      </div>
      <div v-if="!store.loading && !store.listError" class="flex shrink-0 items-center gap-2">
        <button class="inline-flex items-center gap-[6px] whitespace-nowrap rounded-[3px] bg-[var(--color-accent)] px-3.5 py-2 text-[15px] font-medium leading-none text-white transition-colors hover:bg-[var(--color-accent-hover)]" @click="openCreate">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="h-[15px] w-[15px]"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          新建待办
        </button>
      </div>
    </header>

    <div v-if="!store.listError" class="mb-3 flex shrink-0 flex-wrap items-center gap-2.5">
      <div class="inline-flex items-center gap-[2px] rounded-[3px] border border-[var(--color-border)] bg-[var(--color-surface)] p-[2px]">
        <button v-for="option in statusOptions" :key="option.key || 'all'" :aria-label="option.key" :class="store.status === option.key ? 'bg-[var(--color-accent-light)] font-semibold text-[var(--color-accent)]' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-hover)] hover:text-[var(--color-text)]'" class="cursor-pointer rounded-[2px] border-none bg-transparent px-[11px] py-[5px] font-inherit text-sm font-medium transition-colors" @click="store.status = option.key; void store.search()">{{ option.label }}</button>
      </div>
      <div class="inline-flex items-center gap-[2px] rounded-[3px] border border-[var(--color-border)] bg-[var(--color-surface)] p-[2px]">
        <button v-for="option in priorityOptions" :key="option.key || 'all'" :class="store.priority === option.key ? 'bg-[var(--color-accent-light)] font-semibold text-[var(--color-accent)]' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-hover)] hover:text-[var(--color-text)]'" class="cursor-pointer rounded-[2px] border-none bg-transparent px-[11px] py-[5px] font-inherit text-sm font-medium transition-colors" @click="store.priority = option.key; void store.search()">{{ option.label }}</button>
      </div>
      <button :aria-label="store.overdue ? '仅看逾期，已开启' : '仅看逾期'" :class="store.overdue ? 'border-[color-mix(in_srgb,var(--danger)_35%,transparent)] bg-[color-mix(in_srgb,var(--danger)_12%,transparent)] text-[var(--danger)]' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-hover)] hover:text-[var(--color-text)]'" class="inline-flex cursor-pointer items-center gap-[6px] rounded-[3px] border border-[var(--color-border)] bg-[var(--color-surface)] px-[11px] py-[6px] font-inherit text-sm font-medium transition-colors" @click="store.overdue = !store.overdue; void store.search()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-[14px] w-[14px]"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        仅看逾期
      </button>
      <span class="ml-auto text-sm text-[var(--color-text-muted)]">{{ rangeLabel }}</span>
    </div>

    <p v-if="store.loading" role="status" class="sr-only">正在加载待办…</p>
    <div v-if="store.loading" aria-hidden="true" class="overflow-hidden rounded-[3px] border border-[var(--color-border)] bg-[var(--color-surface)]">
      <div class="grid grid-cols-[24px_minmax(0,1fr)_84px] items-center gap-2 border-b border-[var(--color-border)] px-3.5 py-3 lg:grid-cols-[24px_minmax(0,1fr)_52px_68px_104px_56px]">
        <span />
        <span class="text-xs font-semibold tracking-[0.05em] text-[var(--color-text-muted)] uppercase">待办事项</span>
        <span class="hidden text-center text-xs font-semibold tracking-[0.05em] text-[var(--color-text-muted)] uppercase lg:block">优先级</span>
        <span class="hidden text-center text-xs font-semibold tracking-[0.05em] text-[var(--color-text-muted)] uppercase lg:block">状态</span>
        <span class="hidden text-xs font-semibold tracking-[0.05em] text-[var(--color-text-muted)] uppercase lg:block">截止日期</span>
        <span />
      </div>
      <div v-for="n in 8" :key="n" class="flex items-center gap-2.5 border-b border-[var(--color-border)] px-3.5 py-[11px] last:border-b-0">
        <div class="h-[16px] w-[16px] animate-pulse rounded-[2px] bg-[var(--color-hover)]" />
        <div class="min-w-0 flex-1">
          <div class="h-[13px] w-1/2 animate-pulse rounded-[2px] bg-[var(--color-hover)]" />
          <div class="mt-[5px] h-[11px] w-3/4 animate-pulse rounded-[2px] bg-[var(--color-hover)]" />
        </div>
        <div class="hidden h-[20px] w-8 animate-pulse rounded-[2px] bg-[var(--color-hover)] lg:block" />
        <div class="h-[20px] w-11 animate-pulse rounded-[2px] bg-[var(--color-hover)]" />
      </div>
    </div>

    <StateBox v-else-if="store.listError" kind="error" title="加载待办失败" :desc="store.listError">
      <template #icon><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-[26px] w-[26px]"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></template>
      <button class="inline-flex items-center gap-[6px] rounded-[3px] bg-[var(--color-accent)] px-3.5 py-2 text-[15px] font-medium leading-none text-white transition-colors hover:bg-[var(--color-accent-hover)]" @click="store.fetch">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-[15px] w-[15px]"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
        重新加载
      </button>
    </StateBox>

    <StateBox v-else-if="!store.items.length" :title="store.status || store.priority || store.overdue ? '没有符合条件的待办' : '暂无待办事项'" :desc="store.status || store.priority || store.overdue ? '当前筛选条件下没有待办，试试调整筛选条件。' : '当前筛选条件下没有待办。新建一条待办，把今天要做的事先记下来。'">
      <template #icon><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="h-[26px] w-[26px]"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg></template>
      <button v-if="!store.status && !store.priority && !store.overdue" class="inline-flex items-center gap-[6px] rounded-[3px] bg-[var(--color-accent)] px-3.5 py-2 text-[15px] font-medium leading-none text-white transition-colors hover:bg-[var(--color-accent-hover)]" @click="openCreate">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="h-[15px] w-[15px]"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        新建待办
      </button>
    </StateBox>

    <template v-else>
      <p v-if="store.deleteError" role="alert" class="mb-2 rounded-[3px] border border-[color-mix(in_srgb,var(--danger)_35%,var(--color-border))] px-3 py-2 text-sm text-[var(--danger)]">{{ store.deleteError }}</p>
      <div class="overflow-hidden rounded-[3px] border border-[var(--color-border)] bg-[var(--color-surface)]">
        <div class="grid grid-cols-[24px_minmax(0,1fr)_84px] items-center gap-2 border-b border-[var(--color-border)] px-3.5 py-3 lg:grid-cols-[24px_minmax(0,1fr)_52px_68px_104px_56px]">
          <span />
          <span class="text-xs font-semibold tracking-[0.05em] text-[var(--color-text-muted)] uppercase">待办事项</span>
          <span class="hidden text-center text-xs font-semibold tracking-[0.05em] text-[var(--color-text-muted)] uppercase lg:block">优先级</span>
          <span class="hidden text-center text-xs font-semibold tracking-[0.05em] text-[var(--color-text-muted)] uppercase lg:block">状态</span>
          <span class="hidden text-xs font-semibold tracking-[0.05em] text-[var(--color-text-muted)] uppercase lg:block">截止日期</span>
          <span />
        </div>
        <div v-for="todo in store.items" :key="todo.id" class="group grid grid-cols-[24px_minmax(0,1fr)_84px] items-center gap-2 border-b border-[var(--color-border)] px-3.5 py-[11px] transition-colors last:border-b-0 hover:bg-[var(--color-hover)] lg:grid-cols-[24px_minmax(0,1fr)_52px_68px_104px_56px]">
          <button :aria-label="todo.status === 'COMPLETED' ? '恢复待办' : '完成待办'" :class="todo.status === 'COMPLETED' ? 'border-[var(--color-accent)] bg-[var(--color-accent)]' : 'hover:border-[var(--color-accent)]'" class="flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded-[2px] border-[1.5px] border-[var(--color-border)] bg-transparent transition-colors" @click="toggle(todo)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="h-[9px] w-[9px] text-white" :class="todo.status === 'COMPLETED' ? 'block' : 'hidden'"><polyline points="20 6 9 17 4 12"/></svg>
          </button>
          <div class="flex min-w-0 flex-col gap-px">
            <div class="truncate text-base font-medium" :class="todo.status === 'COMPLETED' ? 'text-[var(--color-text-muted)] line-through' : 'text-[var(--color-text)]'">{{ todo.title }}</div>
            <div v-if="todo.remark" class="truncate text-sm" :class="todo.status === 'COMPLETED' ? 'text-[var(--color-text-muted)] opacity-65' : 'text-[var(--color-text-muted)]'">{{ todo.remark }}</div>
          </div>
          <span class="hidden text-center lg:block"><span class="inline-flex items-center justify-center rounded-[3px] px-2 py-px font-mono text-xs font-bold leading-[18px]" :class="priTagClass[todo.priority]">{{ todo.priority }}</span></span>
          <span class="hidden text-center lg:block"><span class="inline-flex items-center justify-center rounded-[3px] px-2 py-px text-xs font-semibold leading-[18px] whitespace-nowrap" :class="stTagClass[todo.status]">{{ statusLabel[todo.status] }}</span></span>
          <span class="hidden items-center gap-[5px] text-sm whitespace-nowrap lg:flex" :class="dueParts(todo).overdue ? 'font-semibold text-[var(--danger)]' : 'text-[var(--color-text-secondary)]'">
            <svg v-if="dueParts(todo).overdue" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-3 w-3 shrink-0 text-[var(--danger)]"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-3 w-3 shrink-0 text-[var(--color-text-muted)]"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            <span>{{ dueParts(todo).date }}</span>
            <em v-if="dueParts(todo).label" class="text-[13px] not-italic" :class="dueParts(todo).overdue ? 'text-[var(--danger)]' : 'text-[var(--color-text-muted)]'">{{ dueParts(todo).label }}</em>
          </span>
          <span class="ml-auto flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <button aria-label="编辑" class="flex h-6 w-6 cursor-pointer items-center justify-center rounded-[2px] text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-hover)] hover:text-[var(--color-text)]" @click="openEdit(todo)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-[14px] w-[14px]"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button aria-label="删除" class="flex h-6 w-6 cursor-pointer items-center justify-center rounded-[2px] text-[var(--color-text-muted)] transition-colors hover:bg-[color-mix(in_srgb,var(--danger)_12%,transparent)] hover:text-[var(--danger)]" :disabled="store.deleting" @click="remove(todo)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-[14px] w-[14px]"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </span>
        </div>
      </div>
      <PaginationNav class="mb-4" :page="store.pagination.page" :total-pages="store.pagination.totalPages" @page="store.setPage" />
    </template>

    <Modal :open="formOpen" :title="editing ? '编辑待办' : '新建待办'" @close="formOpen = false">
      <form class="space-y-4" @submit.prevent="save">
        <label class="block text-[15px] font-medium text-[var(--color-text-secondary)]">
          标题
          <input v-model="form.title" aria-label="标题" required class="mt-1 w-full rounded-[3px] border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-[15px] text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none" />
        </label>
        <label class="block text-[15px] font-medium text-[var(--color-text-secondary)]">
          截止日期
          <input v-model="form.dueDate" aria-label="截止日期" type="date" class="mt-1 w-full rounded-[3px] border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-[15px] text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none" />
        </label>
        <div class="grid grid-cols-2 gap-3">
          <label class="block text-[15px] font-medium text-[var(--color-text-secondary)]">
            优先级
            <select v-model="form.priority" aria-label="优先级" required class="mt-1 w-full rounded-[3px] border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-[15px] text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none"><option>P0</option><option>P1</option><option>P2</option></select>
          </label>
          <label class="block text-[15px] font-medium text-[var(--color-text-secondary)]">
            状态
            <select v-model="form.status" aria-label="状态" class="mt-1 w-full rounded-[3px] border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-[15px] text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none"><option value="TODO">待处理</option><option value="IN_PROGRESS">进行中</option><option value="COMPLETED">已完成</option></select>
          </label>
        </div>
        <label class="block text-[15px] font-medium text-[var(--color-text-secondary)]">
          备注
          <textarea v-model="form.remark" aria-label="备注" class="mt-1 w-full rounded-[3px] border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-[15px] text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none" />
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