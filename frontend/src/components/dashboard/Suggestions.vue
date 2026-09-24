<!-- 下一步建议：后端暂无接口，前端写死推荐项，待后端实现后替换为真实数据。 -->
<script setup lang="ts">
// TODO: 后端接口待实现，当前为前端写死的建议数据。
interface Suggestion { dot: string; title: string; desc: string; tag?: { text: string; tone: 'hot' | 'done' } }

const suggestions: Suggestion[] = [
  { dot: 'var(--danger)', title: '复习错题集中的分类', desc: '优先攻克近期错题对应的知识点', tag: { text: '优先', tone: 'hot' } },
  { dot: 'var(--warning)', title: '推进本周学习目标', desc: '保持每日练习节奏，巩固薄弱环节', tag: { text: '进行中', tone: 'hot' } },
  { dot: 'var(--color-accent)', title: '重做未通过的题目', desc: '回顾上次未一遍过的题，再练一次' },
  { dot: 'var(--success)', title: '保持连续打卡', desc: '坚持每日刷题，形成肌肉记忆', tag: { text: '稳定', tone: 'done' } },
];
</script>
<template>
  <div class="flex flex-col">
    <div v-for="(item, index) in suggestions" :key="index" class="flex items-start gap-2.5 py-2.5" :class="index > 0 ? 'border-t border-[var(--color-border)]' : ''">
      <span class="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" :style="{ background: item.dot }" />
      <div class="min-w-0 flex-1">
        <p class="text-[17px] font-medium text-[var(--color-text)]">{{ item.title }}</p>
        <p class="mt-px text-[15px] text-[var(--color-text-muted)]">{{ item.desc }}</p>
        <span v-if="item.tag" class="mt-0.5 inline-block rounded-[2px] px-1.5 text-[13px] font-semibold leading-5" :class="item.tag.tone === 'hot' ? 'bg-[var(--danger)]/14 text-[var(--danger)]' : 'bg-[var(--success)]/14 text-[var(--success)]'">{{ item.tag.text }}</span>
      </div>
    </div>
  </div>
</template>