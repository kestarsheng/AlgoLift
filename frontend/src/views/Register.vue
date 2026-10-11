<!-- User registration page. -->
<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
const auth = useAuthStore();
const router = useRouter();
const email = ref('');
const password = ref('');
const displayName = ref('');
const submit = async (): Promise<void> => { if (await auth.register(email.value, password.value, displayName.value)) await router.push('/categories'); };
</script>
<template>
  <main class="min-h-screen bg-[var(--color-bg)]">
    <div class="mx-auto w-full max-w-5xl px-5 py-8 lg:grid lg:min-h-screen lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-center lg:gap-12 lg:px-10 lg:py-0">
      <section class="mb-8 lg:mb-0">
        <div class="flex items-center gap-2.5">
          <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-[3px] bg-[var(--color-accent)]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5 text-white"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
          </div>
          <div>
            <div class="text-2xl font-bold tracking-tight text-[var(--color-text)] [font-family:var(--font-heading)]">AlgoLift</div>
            <div class="text-xs font-medium uppercase tracking-[0.04em] text-[var(--color-text-muted)]">算法学习工作台</div>
          </div>
        </div>
        <p class="mt-6 max-w-sm text-[15px] leading-relaxed text-[var(--color-text-secondary)]">记录刷题进度、整理错题与题解笔记，构建属于你的算法知识库，让每一次练习都沉淀为可复用的经验。</p>
      </section>
      <section class="border border-[var(--color-border)] bg-[var(--color-surface)] p-5 lg:p-7">
        <h1 class="text-2xl font-semibold text-[var(--color-text)]">注册 AlgoLift</h1>
        <form class="mt-6 space-y-4" @submit.prevent="submit">
          <label class="block text-sm font-medium text-[var(--color-text-secondary)]">邮箱
            <input v-model="email" type="email" required aria-label="邮箱" placeholder="you@example.com" class="mt-1 w-full border border-[var(--color-border)] bg-transparent p-2 text-[var(--color-text)] outline-none transition-colors placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent)]" />
          </label>
          <label class="block text-sm font-medium text-[var(--color-text-secondary)]">密码
            <input v-model="password" type="password" required aria-label="密码" placeholder="••••••••" class="mt-1 w-full border border-[var(--color-border)] bg-transparent p-2 text-[var(--color-text)] outline-none transition-colors placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent)]" />
          </label>
          <label class="block text-sm font-medium text-[var(--color-text-secondary)]">显示名称
            <input v-model="displayName" type="text" aria-label="显示名称" placeholder="你的昵称" class="mt-1 w-full border border-[var(--color-border)] bg-transparent p-2 text-[var(--color-text)] outline-none transition-colors placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent)]" />
          </label>
          <p v-if="auth.registerError" role="alert" class="text-sm text-[var(--danger)]">{{ auth.registerError }}</p>
          <button :disabled="auth.loading" class="w-full bg-[var(--color-accent)] px-4 py-2 font-semibold text-white transition-colors hover:bg-[var(--color-accent-hover)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-[var(--color-accent)]">{{ auth.loading ? '注册中…' : '注册' }}</button>
        </form>
        <RouterLink class="mt-5 inline-block text-sm text-[var(--color-accent)] underline underline-offset-2" to="/login">已有账号？登录</RouterLink>
      </section>
    </div>
  </main>
</template>