<!-- 通用确认弹窗：遮罩 + 面板，标题/文案/按钮文案 props，slot 优先于 message 渲染，确认按钮用危险色并支持 loading 禁用态。 -->
<script setup lang="ts">
import { nextTick, ref, watch } from 'vue';
const props = withDefaults(defineProps<{ open: boolean; title: string; message?: string; loading?: boolean; confirmText?: string; cancelText?: string }>(), { message: '', loading: false, confirmText: '确认删除', cancelText: '取消' });
const emit = defineEmits<{ confirm: []; cancel: [] }>();
const confirmRef = ref<HTMLButtonElement | null>(null);
watch(() => props.open, async (open) => { if (open) { await nextTick(); confirmRef.value?.focus(); } });
</script>
<template>
  <div v-if="open" class="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4" @click.self="!loading && emit('cancel')">
    <div class="w-full max-w-sm space-y-4 rounded-[3px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5" role="alertdialog" aria-modal="true" :aria-label="title" tabindex="-1" @keydown.esc="!loading && emit('cancel')">
      <h3 class="text-xl font-semibold text-[var(--color-text)] [font-family:var(--font-heading)]">{{ title }}</h3>
      <p v-if="!$slots.default" class="text-[15px] leading-relaxed text-[var(--color-text-secondary)]">{{ message }}</p>
      <slot />
      <div class="flex justify-end gap-3">
        <button type="button" class="rounded-[3px] border border-[var(--color-border)] px-4 py-2 text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-hover)]" :disabled="loading" @click="emit('cancel')">{{ cancelText }}</button>
        <button ref="confirmRef" type="button" class="rounded-[3px] bg-[var(--danger)] px-4 py-2 font-medium text-white transition-opacity disabled:opacity-50" :disabled="loading" @click="emit('confirm')">{{ loading ? '删除中…' : confirmText }}</button>
      </div>
    </div>
  </div>
</template>