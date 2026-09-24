<!-- 分类新建/编辑模态框：受控组件，提交结果由父级通过 emit 处理。 -->
<script setup lang="ts">
import { nextTick, ref, watch } from 'vue';
import type { Category } from '../types';

const props = defineProps<{ open: boolean; editing: Category | null; saving: boolean; error: string }>();
const emit = defineEmits<{ submit: [name: string]; close: [] }>();

const name = ref('');
const input = ref<HTMLInputElement | null>(null);

// 每次打开时同步初值：编辑态回填原名，新建态清空，并聚焦输入框。
watch(() => props.open, async (open) => {
  if (!open) return;
  name.value = props.editing?.name ?? '';
  await nextTick();
  input.value?.focus();
});

const submit = (): void => {
  const value = name.value.trim();
  if (!value) return;
  emit('submit', value);
};
</script>
<template>
  <div v-if="open" class="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4" @click.self="emit('close')">
    <form class="w-full max-w-md space-y-4 rounded-[3px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5" @submit.prevent="submit">
      <h3 class="text-xl font-semibold text-[var(--color-text)] [font-family:var(--font-heading)]">{{ editing ? '编辑分类' : '新建分类' }}</h3>
      <label class="block text-[15px] text-[var(--color-text-secondary)]">
        分类名称
        <input ref="input" v-model="name" required maxlength="100" aria-label="分类名称" placeholder="例如：动态规划" class="mt-1 w-full rounded-[3px] border border-[var(--color-border)] bg-transparent px-3 py-2 text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]" />
      </label>
      <p v-if="error" role="alert" class="text-sm text-[var(--danger)]">{{ error }}</p>
      <div class="flex justify-end gap-3">
        <button type="button" class="rounded-[3px] border border-[var(--color-border)] px-4 py-2 text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-hover)]" @click="emit('close')">取消</button>
        <button :disabled="saving || !name.trim()" type="submit" class="rounded-[3px] bg-[var(--color-accent)] px-4 py-2 font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)] disabled:opacity-50">{{ saving ? '保存中…' : '保存' }}</button>
      </div>
    </form>
  </div>
</template>
