<!-- 进度环：SVG 圆环显示百分比，中心标注数值。 -->
<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(defineProps<{ percent: number; size?: number }>(), { size: 52 });

const RADIUS = 24;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const clamped = computed(() => Math.max(0, Math.min(100, props.percent)));
const offset = computed(() => CIRCUMFERENCE - (clamped.value / 100) * CIRCUMFERENCE);
</script>
<template>
  <div class="relative shrink-0" :style="{ width: `${size}px`, height: `${size}px` }">
    <svg viewBox="0 0 60 60" class="h-full w-full -rotate-90">
      <circle cx="30" cy="30" :r="RADIUS" fill="none" stroke="var(--color-hover)" stroke-width="4" />
      <circle cx="30" cy="30" :r="RADIUS" fill="none" stroke="var(--color-accent)" stroke-width="4" stroke-linecap="round" :stroke-dasharray="CIRCUMFERENCE" :stroke-dashoffset="offset" />
    </svg>
    <span class="absolute inset-0 flex items-center justify-center font-mono text-base font-bold text-[var(--color-accent)]">{{ clamped }}%</span>
  </div>
</template>