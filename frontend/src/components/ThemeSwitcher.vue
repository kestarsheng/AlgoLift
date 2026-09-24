<!-- 顶部导航主题切换器：8 种主题下拉选择，持久化到 localStorage。 -->
<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { THEME_OPTIONS, useThemeStore } from '../stores/theme';
import type { ThemeKey } from '../stores/theme';

const theme = useThemeStore();
const open = ref(false);
const root = ref<HTMLElement | null>(null);

const toggle = (): void => { open.value = !open.value; };
const pick = (key: ThemeKey): void => { theme.apply(key); open.value = false; };
const onDocumentClick = (event: MouseEvent): void => {
  if (open.value && root.value && !root.value.contains(event.target as Node)) open.value = false;
};
onMounted(() => document.addEventListener('click', onDocumentClick));
onBeforeUnmount(() => document.removeEventListener('click', onDocumentClick));
</script>
<template>
  <div ref="root" class="relative">
    <button class="flex h-8 w-8 items-center justify-center rounded-[3px] border border-[var(--color-border)] text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-hover)]" title="切换主题" aria-label="切换主题" aria-haspopup="listbox" :aria-expanded="open" @click="toggle">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-[15px] w-[15px]"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
    </button>
    <div v-if="open" class="absolute right-0 top-[calc(100%+5px)] z-50 w-44 rounded-[3px] border border-[var(--color-border)] bg-[var(--color-surface)] p-1.5" role="listbox">
      <button v-for="opt in THEME_OPTIONS" :key="opt.key" type="button" role="option" :aria-selected="opt.key === theme.theme" class="flex w-full items-center gap-2 rounded-[3px] px-2.5 py-1.5 text-left text-[15px] transition-colors" :class="opt.key === theme.theme ? 'bg-[var(--color-accent-light)] font-semibold text-[var(--color-accent)]' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-hover)]'" @click="pick(opt.key)">
        <span class="h-3 w-3 shrink-0 rounded-full border-[1.5px] border-[var(--color-border)]" :style="{ background: opt.dot }" />
        <span>{{ opt.label }}</span>
      </button>
    </div>
  </div>
</template>