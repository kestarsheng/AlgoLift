<!-- 应用外壳：原型侧边栏（Logo+导航+用户卡+退出下拉）+ 顶部栏（标题+搜索/通知/主题/头像），所有路由共享。 -->
<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { RouterLink } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useThemeStore } from '../stores/theme';
import ThemeSwitcher from './ThemeSwitcher.vue';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const theme = useThemeStore();

const userMenuOpen = ref(false);
const toggleUserMenu = (event: Event): void => { event.stopPropagation(); userMenuOpen.value = !userMenuOpen.value; };
const closeUserMenu = (): void => { userMenuOpen.value = false; };
const logout = (): void => { userMenuOpen.value = false; auth.logout(); void router.push('/login'); };

onMounted(async () => {
  theme.init();
  if (auth.token && !auth.user) await auth.fetchCurrentUser();
  document.addEventListener('click', closeUserMenu);
});
onUnmounted(() => { document.removeEventListener('click', closeUserMenu); });

const navigation = [
  { label: '数据概览', path: '/dashboard', icon: '<rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/>' },
  { label: '刷题练习', path: '/categories', icon: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>' },
  { label: '错题本', path: '/wrongs', icon: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><line x1="9" y1="10" x2="15" y2="10"/>' },
  { label: '题解笔记', path: '/notes', icon: '<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>' },
  { label: '待办', path: '/todos', icon: '<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>' },
  { label: '学习进度', path: '/progress', icon: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>' },
];
const activePath = computed(() => route.path === '/dashboard' ? '/dashboard' : route.path.startsWith('/categories') || route.path.startsWith('/problems') ? '/categories' : route.path.startsWith('/notes') ? '/notes' : route.path.startsWith('/todos') ? '/todos' : route.path.startsWith('/progress') ? '/progress' : '/wrongs');
const userInitial = computed(() => (auth.user?.displayName || auth.user?.email || 'U').charAt(0).toUpperCase());
</script>
<template>
  <div v-if="auth.isAuthenticated" class="min-h-screen lg:grid lg:grid-cols-[232px_1fr]">
    <aside class="flex flex-col border-b border-[var(--color-border)] bg-[var(--color-surface)] lg:sticky lg:top-0 lg:min-h-screen lg:border-b-0 lg:border-r">
      <div class="flex items-center gap-2.5 border-b border-[var(--color-border)] px-[18px] py-4">
        <div class="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[3px] bg-[var(--color-accent)]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 text-white"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
        </div>
        <div>
          <div class="text-[19px] font-bold tracking-tight text-[var(--color-text)] [font-family:var(--font-heading)]">AlgoLift</div>
          <div class="text-xs font-medium uppercase tracking-[0.04em] text-[var(--color-text-muted)]">算法学习工作台</div>
        </div>
      </div>
      <nav class="flex gap-2 overflow-x-auto p-2.5 lg:block lg:flex-1 lg:overflow-y-auto lg:overflow-x-visible" aria-label="主导航">
        <div class="hidden pt-[5px] pb-[3px] px-2 text-[13px] font-semibold uppercase tracking-[0.06em] text-[var(--color-text-muted)] lg:block">导航</div>
        <RouterLink v-for="item in navigation" :key="item.path" :to="item.path" :aria-current="activePath === item.path ? 'page' : undefined" class="flex shrink-0 items-center gap-[9px] rounded-[3px] px-[9px] py-[7px] text-base font-medium transition-colors lg:mb-px lg:shrink" :class="activePath === item.path ? 'bg-[var(--color-accent-light)] font-semibold text-[var(--color-accent)]' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-hover)] hover:text-[var(--color-text)]'">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 shrink-0" v-html="item.icon" />
          {{ item.label }}
        </RouterLink>
      </nav>
      <div class="hidden border-t border-[var(--color-border)] p-2.5 lg:block">
        <div class="relative">
          <button class="flex w-full items-center gap-2 rounded-[3px] px-[7px] py-[5px] transition-colors hover:bg-[var(--color-hover)]" @click="toggleUserMenu">
            <div class="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-[3px] bg-[var(--color-accent)] text-sm font-bold text-white">{{ userInitial }}</div>
            <div class="min-w-0 flex-1 text-left">
              <div class="truncate text-[15px] font-semibold text-[var(--color-text)]">{{ auth.user?.displayName || '学习者' }}</div>
              <div class="truncate text-[13px] text-[var(--color-text-muted)]">{{ auth.user?.email }}</div>
            </div>
          </button>
          <div v-if="userMenuOpen" class="absolute bottom-full left-0 right-0 mb-1 rounded-[3px] border border-[var(--color-border)] bg-[var(--color-surface)] p-1.5" @click.stop>
            <button class="flex w-full items-center gap-2 rounded-[3px] px-[9px] py-[7px] text-[15px] text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-hover)]" @click="logout">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              退出登录
            </button>
          </div>
        </div>
      </div>
    </aside>
    <main class="min-w-0">
      <header class="sticky top-0 z-30 flex h-[50px] items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface-topbar)] px-3 backdrop-blur lg:px-[22px]">
        <div class="flex items-center gap-2.5">
          <span class="text-lg font-semibold tracking-tight text-[var(--color-text)]">AlgoLift</span>
          <span class="rounded-[3px] bg-[var(--color-hover)] px-2 py-px text-xs font-semibold text-[var(--color-text-muted)]">v0.2</span>
        </div>
        <div class="flex items-center gap-1">
          <button class="flex h-8 w-8 items-center justify-center rounded-[3px] text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-hover)]" title="搜索">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </button>
          <button class="flex h-8 w-8 items-center justify-center rounded-[3px] text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-hover)]" title="通知">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4"><path d="M6 8a6 6 0 0 1 12 0c0 7 4 9 4 9H2s4-2 4-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          </button>
          <ThemeSwitcher />
          <div class="ml-0.5 flex h-7 w-7 items-center justify-center rounded-[3px] bg-[var(--color-accent)] text-sm font-bold text-white">{{ userInitial }}</div>
        </div>
      </header>
      <div class="p-3 lg:p-[18px]"><slot /></div>
    </main>
  </div>
  <div v-else><slot /></div>
</template>
