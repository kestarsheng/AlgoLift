<!-- 数据概览页：统计卡/分类掌握度/热力图/建议/待办，组装自 dashboard store 与 todo store。 -->
<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useDashboardStore } from '../stores/dashboard';
import StatCard from '../components/dashboard/StatCard.vue';
import ProgressRing from '../components/dashboard/ProgressRing.vue';
import MasteryBar from '../components/dashboard/MasteryBar.vue';
import Heatmap from '../components/dashboard/Heatmap.vue';
import RecentActivity from '../components/dashboard/RecentActivity.vue';
import Suggestions from '../components/dashboard/Suggestions.vue';
import TodoSummary from '../components/dashboard/TodoSummary.vue';

const auth = useAuthStore();
const store = useDashboardStore();
onMounted(() => { void store.fetch(); void store.fetchStats(); });

const allEmpty = computed(() => !store.loading && store.totalProblems === 0 && store.categories.data.length === 0 && !store.latestProgress);

const greeting = computed(() => {
  const hour = new Date().getHours();
  if (hour < 6) return '夜深了，注意休息';
  if (hour < 12) return '早上好，今天继续加油';
  if (hour < 18) return '下午好，保持节奏';
  return '晚上好，来刷一题收尾';
});
</script>
<template>
  <section class="mx-auto flex w-full max-w-[1280px] flex-col">
    <header class="mb-4 shrink-0">
      <h1 class="text-[25px] font-bold tracking-tight text-[var(--color-text)] [font-family:var(--font-heading)]">数据概览</h1>
      <div class="mt-0.5 flex items-center gap-2 text-[17px] text-[var(--color-text-muted)]">
        {{ greeting }}，{{ auth.user?.displayName || '学习者' }}
        <span v-if="store.streakDays > 0" class="inline-flex items-center gap-1 text-base font-semibold text-[var(--color-accent)]">
          <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="h-3.5 w-3.5"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
          连续 {{ store.streakDays }} 天
        </span>
      </div>
    </header>

    <p v-if="store.loading" role="status" class="py-12 text-center">正在加载数据概览…</p>
    <template v-else>
      <p v-if="store.hasErrors" role="alert" class="mb-4 border border-[var(--warning)] bg-[var(--warning)]/10 p-4 text-[var(--warning)]">部分数据加载失败，已展示其余可用内容。</p>

      <div v-if="allEmpty" class="mt-2 border border-[var(--color-border)] p-10 text-center">
        <h3 class="font-semibold">还没有学习数据</h3>
        <p class="mt-2 text-[var(--color-text-muted)]">先去刷一道题，开启你的学习记录。</p>
        <RouterLink class="mt-4 inline-block text-[var(--color-accent)] underline" to="/categories">开始刷题</RouterLink>
      </div>

      <template v-else>
        <div class="mb-3.5 grid shrink-0 grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
          <StatCard label="总题数 · 进度" :hero="true" tone="blue" class="sm:col-span-2 lg:col-span-1">
            <template #icon>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-3 w-3"><path d="M22 10v6M2 10l6 6M2 4l6 6M22 4l-6 6"/><path d="M6 22h12"/><path d="M12 22V10"/></svg>
            </template>
            <ProgressRing :percent="store.averageProgress" />
            <div class="flex min-w-0 flex-col gap-0.5">
              <span class="font-mono text-[35px] font-bold leading-none tracking-tight text-[var(--color-text)]">{{ store.totalProblems }}</span>
              <div class="flex items-center gap-4 text-base text-[var(--color-text-secondary)]">
                <span>已完成 <b class="font-mono font-semibold text-[var(--color-text)]">{{ store.completedProblems }}</b></span>
                <span>正确率 <b class="font-mono font-semibold text-[var(--color-text)]">{{ store.accuracy }}%</b></span>
              </div>
            </div>
          </StatCard>

          <StatCard label="正确率" tone="amber">
            <template #icon>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-3 w-3"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
            </template>
            <span class="mt-1 font-mono text-[27px] font-bold tracking-tight text-[var(--color-text)]">{{ store.accuracy }}%</span>
            <p class="mt-0.5 text-[15px] text-[var(--color-text-muted)]">基于错题占比估算</p>
          </StatCard>

          <StatCard label="今日刷题" tone="slate">
            <template #icon>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-3 w-3"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            </template>
            <span class="mt-1 font-mono text-[27px] font-bold tracking-tight text-[var(--color-text)]">{{ store.todayCount }}</span>
            <p class="mt-0.5 text-[15px] text-[var(--color-text-muted)]">今日练习次数</p>
          </StatCard>

          <StatCard label="连续打卡" tone="green">
            <template #icon>
              <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="h-3 w-3"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
            </template>
            <span class="mt-1 font-mono text-[27px] font-bold tracking-tight text-[var(--color-text)]">{{ store.streakDays }}</span>
            <p class="mt-0.5 text-[15px] text-[var(--color-text-muted)]">连续天数</p>
          </StatCard>
        </div>

        <div class="mb-3.5 grid shrink-0 grid-cols-1 gap-2 lg:grid-cols-[0.9fr_1.1fr]">
          <div class="rounded-[3px] border border-[var(--color-border)] bg-[var(--color-surface)] p-3.5">
            <div class="mb-2.5 flex items-center gap-2">
              <h2 class="text-[17px] font-semibold text-[var(--color-text)] [font-family:var(--font-heading)]">分类掌握度</h2>
              <RouterLink to="/categories" class="ml-auto text-[15px] font-medium text-[var(--color-accent)] hover:text-[var(--color-accent-hover)]">详情 →</RouterLink>
            </div>
            <div v-if="store.categories.data.length">
              <div v-for="item in store.categoryMastery" :key="item.id" class="mb-2 last:mb-0">
                <MasteryBar :id="item.id" :name="item.name" :percent="item.percent" />
              </div>
            </div>
            <p v-else class="py-4 text-center text-[var(--color-text-muted)]">还没有分类数据</p>
          </div>

          <div class="rounded-[3px] border border-[var(--color-border)] bg-[var(--color-surface)] p-3.5">
            <div class="mb-2.5 flex items-center gap-2">
              <h2 class="text-[17px] font-semibold text-[var(--color-text)] [font-family:var(--font-heading)]">最近掌握的知识点</h2>
              <RouterLink to="/progress" class="ml-auto text-[15px] font-medium text-[var(--color-accent)] hover:text-[var(--color-accent-hover)]">全部 →</RouterLink>
            </div>
            <RecentActivity :items="store.recentMastered" />
          </div>
        </div>

        <div class="grid flex-1 grid-cols-1 gap-2 lg:grid-cols-[1.3fr_0.7fr]">
          <div class="flex min-h-0 flex-col gap-2">
            <div class="shrink-0 rounded-[3px] border border-[var(--color-border)] bg-[var(--color-surface)] p-3.5">
              <h2 class="mb-2.5 text-[17px] font-semibold text-[var(--color-text)] [font-family:var(--font-heading)]">活动热力图</h2>
              <Heatmap :days="store.heatmapData" />
            </div>
            <div class="flex-1 rounded-[3px] border border-[var(--color-border)] bg-[var(--color-surface)] p-3.5">
              <TodoSummary />
            </div>
          </div>
          <div class="rounded-[3px] border border-[var(--color-border)] bg-[var(--color-surface)] p-3.5">
            <h2 class="mb-1 text-[17px] font-semibold text-[var(--color-text)] [font-family:var(--font-heading)]">下一步建议</h2>
            <Suggestions />
          </div>
        </div>
      </template>
    </template>
  </section>
</template>