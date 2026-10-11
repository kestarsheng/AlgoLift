<!-- 下一步建议：从后端 GET /api/stats/suggestions 获取基于真实数据的学习建议。 -->
<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useDashboardStore } from '../../stores/dashboard';
const router = useRouter();
const store = useDashboardStore();
onMounted(() => { void store.fetchSuggestions(); });
const dotColor = (priority: string): string => priority === 'high' ? 'var(--danger)' : priority === 'medium' ? 'var(--warning)' : 'var(--color-accent)';
const tagInfo = (priority: string): { text: string; tone: 'hot' | 'done' } | undefined => priority === 'high' ? { text: '优先', tone: 'hot' } : priority === 'medium' ? { text: '建议', tone: 'hot' } : undefined;
const suggestions = computed(() => store.suggestions.data.map((item) => ({ dot: dotColor(item.priority), title: item.title, desc: item.description, tag: tagInfo(item.priority), targetId: item.targetId, targetType: item.targetType })));
const handleClick = (targetType?: string, targetId?: string): void => {
  if (!targetType || !targetId) return;
  if (targetType === 'problem') void router.push(`/problems/${targetId}`);
  else if (targetType === 'wrong') void router.push('/wrongs');
  else if (targetType === 'todo') void router.push('/todos');
};
</script>
<template>
  <div class="flex flex-col">
    <div v-if="store.suggestions.error" class="py-2.5 text-[15px] text-[var(--danger)]">{{ store.suggestions.error }}</div>
    <div v-for="(item, index) in suggestions" :key="index" class="flex items-start gap-2.5 py-2.5" :class="index > 0 ? 'border-t border-[var(--color-border)]' : ''">
      <span class="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" :style="{ background: item.dot }" />
      <div class="min-w-0 flex-1">
        <p class="text-[17px] font-medium text-[var(--color-text)]">{{ item.title }}</p>
        <p class="mt-px text-[15px] text-[var(--color-text-muted)]">{{ item.desc }}</p>
        <span v-if="item.tag" class="mt-0.5 inline-block rounded-[2px] px-1.5 text-[13px] font-semibold leading-5" :class="item.tag.tone === 'hot' ? 'bg-[var(--danger)]/14 text-[var(--danger)]' : 'bg-[var(--success)]/14 text-[var(--success)]'">{{ item.tag.text }}</span>
        <button v-if="item.targetId" class="mt-1 ml-2 inline-block text-[13px] font-medium text-[var(--color-accent)] hover:underline" @click="handleClick(item.targetType, item.targetId)">前往 →</button>
      </div>
    </div>
  </div>
</template>
