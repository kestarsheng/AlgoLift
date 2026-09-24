<!-- �应用外壳：侧边导航 + 顶部栏（含主题切换），所有路由共享。 -->
<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { RouterLink } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useThemeStore } from '../stores/theme';
import ThemeSwitcher from './ThemeSwitcher.vue';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const theme = useThemeStore();

const logout = (): void => { auth.logout(); void router.push('/login'); };
onMounted(async () => { theme.init(); if (auth.token && !auth.user) await auth.fetchCurrentUser(); });

const navigation = [{ label: '数据概览', path: '/dashboard' }, { label: '刷题练习', path: '/categories' }, { label: '错题本', path: '/wrongs' }, { label: '题解笔记', path: '/notes' }, { label: '待办', path: '/todos' }, { label: '学习进度', path: '/progress' }];
const activePath = computed(() => route.path === '/dashboard' ? '/dashboard' : route.path.startsWith('/categories') || route.path.startsWith('/problems') ? '/categories' : route.path.startsWith('/notes') ? '/notes' : route.path.startsWith('/todos') ? '/todos' : route.path.startsWith('/progress') ? '/progress' : '/wrongs');
const pageTitle = computed(() => (route.meta.title as string | undefined) ?? 'AlgoLift');
</script>
<template>
  <div v-if="auth.isAuthenticated" class="min-h-screen md:grid md:grid-cols-[220px_1fr]">
    <aside class="border-b border-[var(--color-border)] bg-[var(--color-surface)] p-4 md:min-h-screen md:border-b-0 md:border-r md:p-6">
      <div class="flex items-baseline justify-between md:block"><p class="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-accent)]">AlgoLift</p><h1 class="mt-1 text-lg font-semibold tracking-tight">算法学习工作台</h1></div>
      <div class="mt-4 flex items-center justify-between gap-3 text-sm"><span>{{ auth.user?.displayName || auth.user?.email }}</span><button class="underline" @click="logout">退出登录</button></div>
      <nav class="mt-5 flex gap-2 md:mt-8 md:block md:space-y-2" aria-label="主导航">
        <RouterLink v-for="item in navigation" :key="item.path" :to="item.path" :aria-current="activePath === item.path ? 'page' : undefined" class="block border px-3 py-2 text-sm transition-colors" :class="activePath === item.path ? 'border-[var(--color-accent)] bg-[var(--color-accent-light)] font-semibold text-[var(--color-text)]' : 'border-transparent hover:border-[var(--color-border)]'">{{ item.label }}</RouterLink>
      </nav>
    </aside>
    <main class="min-w-0">
      <header class="sticky top-0 z-30 flex h-[50px] items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface-topbar)] px-4 backdrop-blur md:px-6">
        <div class="flex items-center gap-2">
          <span class="text-lg font-semibold tracking-tight text-[var(--color-text)]">{{ pageTitle }}</span>
        </div>
        <div class="flex items-center gap-1">
          <ThemeSwitcher />
          <div class="ml-1 flex h-7 w-7 items-center justify-center rounded-[3px] bg-[var(--color-accent)] text-sm font-bold text-white">{{ (auth.user?.displayName || auth.user?.email || 'U').charAt(0).toUpperCase() }}</div>
        </div>
      </header>
      <div class="p-3 md:p-6"><slot /></div>
    </main>
  </div>
  <div v-else><slot /></div>
</template>