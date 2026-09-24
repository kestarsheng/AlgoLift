<!-- 练习记录列表：展示日期、序号、是否一遍做对与备注，支持新增和删除。 -->
<script setup lang="ts">
import { reactive, ref } from 'vue';
import { usePracticeRecordStore } from '../../stores/practiceRecord';

const store = usePracticeRecordStore();
const open = ref(false);
const form = reactive({ practicedAt: new Date().toISOString().slice(0, 10), solvedFirstTry: true, remark: '' });

/** 记录序号：按时间倒序，第 1 条为最新一次，因此用「总数 - 下标」推算次数。 */
const ordinal = (index: number): number => Math.max(store.total - ((store.pagination.page - 1) * store.pagination.pageSize + index), 1);

const submit = async (): Promise<void> => {
  if (!form.practicedAt) return;
  try {
    await store.create({ practicedAt: form.practicedAt, solvedFirstTry: form.solvedFirstTry, ...(form.remark.trim() ? { remark: form.remark.trim() } : {}) });
    form.remark = '';
    form.solvedFirstTry = true;
    open.value = false;
  } catch {
    // 失败时 store.error 已写入，保留表单让用户重试。
  }
};
const remove = async (recordId: string): Promise<void> => { if (window.confirm('确认删除这条练习记录吗？')) await store.remove(recordId); };
</script>
<template>
  <div class="rounded-[3px] border border-[var(--color-border)] bg-[var(--color-surface)] p-3.5">
    <div class="mb-3 flex items-center gap-2">
      <span class="text-[17px] font-semibold text-[var(--color-text)] [font-family:var(--font-heading)]">练习记录</span>
      <span v-if="!store.loading && !store.error" class="text-[15px] text-[var(--color-text-muted)]">{{ store.total }} 次</span>
      <button class="ml-auto inline-flex items-center gap-[6px] rounded-[3px] bg-[var(--color-accent)] px-[11px] py-[5px] text-sm font-medium leading-none text-white transition-colors hover:bg-[var(--color-accent-hover)]" @click="open = !open">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="h-[13px] w-[13px]"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        记一次练习
      </button>
    </div>

    <form v-if="open" class="mb-3 flex flex-wrap items-end gap-3 rounded-[3px] bg-[var(--color-hover)] p-3" @submit.prevent="submit">
      <label class="text-sm text-[var(--color-text-secondary)]">
        练习日期
        <input v-model="form.practicedAt" type="date" required aria-label="练习日期" class="mt-1 block rounded-[3px] border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-1.5 text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]" />
      </label>
      <label class="flex items-center gap-1.5 pb-1.5 text-sm text-[var(--color-text-secondary)]">
        <input v-model="form.solvedFirstTry" type="checkbox" class="accent-[var(--color-accent)]" />
        一遍做对
      </label>
      <label class="min-w-[180px] flex-1 text-sm text-[var(--color-text-secondary)]">
        备注
        <input v-model="form.remark" aria-label="练习备注" placeholder="备注（可选）" class="mt-1 block w-full rounded-[3px] border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-1.5 text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]" />
      </label>
      <button :disabled="store.saving" type="submit" class="rounded-[3px] bg-[var(--color-accent)] px-[11px] py-[5px] text-sm font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)] disabled:opacity-50">{{ store.saving ? '保存中…' : '保存记录' }}</button>
    </form>

    <p v-if="store.loading" role="status" class="py-6 text-center text-sm text-[var(--color-text-muted)]">正在加载练习记录…</p>
    <div v-else-if="store.error" role="alert" class="rounded-[3px] border border-[color-mix(in_srgb,var(--danger)_35%,var(--color-border))] p-3 text-sm text-[var(--danger)]">{{ store.error }}</div>
    <p v-else-if="!store.items.length" class="py-6 text-center text-[15px] text-[var(--color-text-muted)]">还没有练习记录，点击右上角「记一次练习」开始记录。</p>
    <div v-else>
      <div v-for="(record, i) in store.items" :key="record.id" class="grid grid-cols-[auto_auto_1fr] items-center gap-2.5 border-t border-[var(--color-border)] py-[9px] first:border-t-0 sm:grid-cols-[auto_auto_auto_minmax(0,1fr)] sm:gap-2.5">
        <span class="whitespace-nowrap font-mono text-sm text-[var(--color-text-muted)]">{{ record.practicedAt.slice(0, 10) }}</span>
        <span class="whitespace-nowrap rounded-[2px] bg-[var(--color-hover)] px-1.5 text-[13px] font-semibold leading-5 text-[var(--color-text-secondary)]">第 {{ ordinal(i) }} 次</span>
        <span class="inline-flex items-center gap-1 whitespace-nowrap text-[13px] font-semibold" :class="record.solvedFirstTry ? 'text-[var(--success)]' : 'text-[var(--danger)]'">
          <svg v-if="record.solvedFirstTry" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="h-[13px] w-[13px]"><polyline points="20 6 9 17 4 12"/></svg>
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="h-[13px] w-[13px]"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          {{ record.solvedFirstTry ? '一遍做对' : '未一遍做对' }}
        </span>
        <div class="col-span-3 flex min-w-0 items-center gap-2 sm:col-span-1">
          <span class="min-w-0 flex-1 truncate text-[15px] text-[var(--color-text-secondary)]">{{ record.remark || '—' }}</span>
          <button class="shrink-0 text-[13px] text-[var(--color-text-muted)] underline transition-colors hover:text-[var(--danger)]" @click="remove(record.id)">删除</button>
        </div>
      </div>
    </div>
  </div>
</template>
