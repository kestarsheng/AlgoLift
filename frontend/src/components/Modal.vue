<!-- 通用模态框壳：遮罩 + 居中卡片，标题由 props 传入，内容走插槽。 -->
<script setup lang="ts">
defineProps<{ open: boolean; title: string }>();
const emit = defineEmits<{ close: [] }>();
</script>
<template>
  <div v-if="open" class="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4" @click.self="emit('close')">
    <div class="w-full max-w-lg space-y-4 rounded-[3px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <h3 class="text-xl font-semibold text-[var(--color-text)] [font-family:var(--font-heading)]">{{ title }}</h3>
      <slot />
    </div>
  </div>
</template>