<!-- 活动热力图：52 周 × 7 格完整网格，周日列首，正方形格子，今天高亮，hover 显示日期与次数。 -->
<script setup lang="ts">
import { computed } from 'vue';
import type { HeatmapDay } from '../../stores/dashboard';

const props = defineProps<{ days: HeatmapDay[] }>();

const WEEK_LABELS = ['日', '一', '二', '三', '四', '五', '六'];
const CELL = 11;
const GAP = 3;

const weeks = computed<HeatmapDay[][]>(() => {
  const result: HeatmapDay[][] = [];
  for (let index = 0; index < props.days.length; index += 7) result.push(props.days.slice(index, index + 7));
  return result;
});

interface MonthLabel { month: number; span: number }
const monthLabels = computed<MonthLabel[]>(() => {
  const labels: MonthLabel[] = [];
  for (const week of weeks.value) {
    const first = week.find((day) => day.level >= 0 && day.date);
    if (!first) { labels.push({ month: -1, span: 1 }); continue; }
    const month = new Date(`${first.date}T00:00:00.000Z`).getUTCMonth();
    const last = labels[labels.length - 1];
    if (last && last.month === month) last.span += 1;
    else labels.push({ month, span: 1 });
  }
  return labels;
});

const todayDate = new Date().toISOString().slice(0, 10);
const heatClass = (level: number): string => `bg-[var(--heat-${level < 0 ? 0 : level})]`;
const cellTitle = (day: HeatmapDay): string => day.level < 0 || !day.date ? '' : `${day.date} · ${day.count} 次练习`;
const monthWidth = (span: number): string => `${span * (CELL + GAP) - GAP}px`;
</script>
<template>
  <div v-if="days.length">
    <div class="overflow-x-auto">
      <div class="mb-0.5 flex gap-[3px] pl-[30px]">
        <span v-for="(label, index) in monthLabels" :key="index" class="h-4 shrink-0 text-center font-mono text-xs leading-4 text-[var(--color-text-muted)]" :style="{ width: monthWidth(label.span) }">{{ label.month >= 0 ? label.month + 1 : '' }}</span>
      </div>
      <div class="flex gap-[3px]">
        <div class="flex shrink-0 flex-col gap-[3px]">
          <span v-for="(label, index) in WEEK_LABELS" :key="index" class="h-3.5 w-6 pr-1.5 text-right font-mono text-[11px] leading-[14px] text-[var(--color-text-muted)]">{{ label }}</span>
        </div>
        <div class="flex gap-[3px]">
          <div v-for="(week, weekIndex) in weeks" :key="weekIndex" class="flex flex-col gap-[3px]">
            <div v-for="(day, dayIndex) in week" :key="dayIndex" class="h-[11px] w-[11px] rounded-[2px] transition-transform" :class="[heatClass(day.level), day.level < 0 ? 'cursor-default' : 'cursor-pointer hover:scale-[1.35] hover:z-10', day.date === todayDate ? 'outline-[1.5px] outline outline-offset-[-1px] outline-[var(--color-accent)]' : '']" :title="cellTitle(day)" />
          </div>
        </div>
      </div>
    </div>
    <div class="mt-0.5 flex items-center justify-end gap-[3px] font-mono text-[10px] text-[var(--color-text-muted)]">
      <span>少</span>
      <span class="h-[11px] w-[11px] rounded-[2px] bg-[var(--heat-0)]" />
      <span class="h-[11px] w-[11px] rounded-[2px] bg-[var(--heat-1)]" />
      <span class="h-[11px] w-[11px] rounded-[2px] bg-[var(--heat-2)]" />
      <span class="h-[11px] w-[11px] rounded-[2px] bg-[var(--heat-3)]" />
      <span class="h-[11px] w-[11px] rounded-[2px] bg-[var(--heat-4)]" />
      <span>多</span>
      <span class="w-3" />
      <span class="h-[11px] w-[11px] rounded-[2px] bg-[var(--heat-0)] outline-[1.5px] outline outline-offset-[-1px] outline-[var(--color-accent)]" />
      <span>= 今天</span>
    </div>
  </div>
  <p v-else class="py-6 text-center text-[var(--color-text-muted)]">暂无活动数据</p>
</template>
