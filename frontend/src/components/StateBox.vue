<!-- 通用状态框：空态/错误态，图标 + 标题 + 描述 + 可选操作区。 -->
<script setup lang="ts">
defineProps<{ kind?: 'info' | 'error'; title: string; desc: string }>();
</script>
<template>
  <div class="flex min-h-[320px] flex-1 flex-col items-center justify-center gap-3.5 rounded-[3px] border border-[var(--color-border)] bg-[var(--color-surface)] p-12 text-center">
    <div class="flex h-[54px] w-[54px] items-center justify-center rounded-[3px]" :class="kind === 'error' ? 'bg-[color-mix(in_srgb,var(--danger)_12%,transparent)] text-[var(--danger)]' : 'bg-[var(--color-hover)] text-[var(--color-text-muted)]'">
      <slot name="icon" />
    </div>
    <div class="text-[19px] font-semibold text-[var(--color-text)] [font-family:var(--font-heading)]">{{ title }}</div>
    <div class="max-w-[380px] text-[15px] leading-normal text-[var(--color-text-muted)]">{{ desc }}</div>
    <slot />
  </div>
</template>