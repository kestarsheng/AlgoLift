<!-- 笔记详情：卡片布局、modal 编辑/删除确认、关联错题侧栏，风格统一 ProblemDetail。 -->
<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useNoteStore } from '../stores/note';
import RichTextEditor from '../components/editor/RichTextEditor.vue';
import MarkdownRenderer from '../components/editor/MarkdownRenderer.vue';

const route = useRoute();
const router = useRouter();
const store = useNoteStore();
const id = String(route.params.noteId);

const editing = ref(false);
const confirming = ref(false);
const form = reactive({ title: '', content: '' });

function edit(): void {
  if (!store.note) return;
  form.title = store.note.title;
  form.content = store.note.content ?? '';
  store.saveError = '';
  editing.value = true;
}
async function save(): Promise<void> {
  if (!form.title.trim()) return;
  if (await store.update(id, { title: form.title, content: form.content })) editing.value = false;
}
async function remove(): Promise<void> {
  if (await store.remove(id)) { confirming.value = false; await router.push('/notes'); }
}
onMounted(() => store.fetch(id));
</script>

<template>
  <section class="mx-auto flex w-full max-w-[1280px] flex-col">
    <p v-if="store.loading" role="status" class="py-12 text-center text-sm text-[var(--color-text-muted)]">正在加载笔记详情…</p>

    <template v-else-if="store.note">
      <div class="mb-4 shrink-0">
        <RouterLink to="/notes" class="mb-2 inline-flex items-center gap-[5px] text-[15px] font-medium text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-accent)]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="h-3.5 w-3.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          返回笔记列表
        </RouterLink>
        <h1 class="text-[25px] font-bold tracking-tight text-[var(--color-text)] [font-family:var(--font-heading)]">{{ store.note.title }}</h1>
      </div>

      <div class="grid items-start gap-2 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)]">
        <div class="flex min-w-0 flex-col gap-2">
          <div class="rounded-[3px] border border-[var(--color-border)] bg-[var(--color-surface)] p-3.5">
            <div class="mb-3 flex items-center gap-2">
              <span class="text-[17px] font-semibold text-[var(--color-text)] [font-family:var(--font-heading)]">笔记内容</span>
              <div class="ml-auto flex gap-2">
                <button class="inline-flex items-center gap-[5px] text-[15px] font-medium text-[var(--color-accent)] transition-colors hover:text-[var(--color-accent-hover)]" @click="edit">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-3.5 w-3.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  编辑
                </button>
                <button class="inline-flex items-center gap-[5px] text-[15px] font-medium text-[var(--danger)] transition-colors hover:opacity-80" @click="confirming = true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-3.5 w-3.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  删除
                </button>
              </div>
            </div>
            <MarkdownRenderer v-if="store.note.content" :content="store.note.content" />
            <p v-else class="py-4 text-center text-[15px] text-[var(--color-text-muted)]">暂无内容，点击「编辑」补充笔记。</p>
          </div>
        </div>

        <div class="flex min-w-0 flex-col gap-2">
          <div class="rounded-[3px] border border-[var(--color-border)] bg-[var(--color-surface)] p-3.5">
            <div class="mb-3 flex items-center gap-2">
              <span class="text-[17px] font-semibold text-[var(--color-text)] [font-family:var(--font-heading)]">关联错题</span>
            </div>
            <ul class="space-y-2">
              <li v-for="wrong in store.wrongs" :key="wrong.id">
                <RouterLink :to="`/wrongs/${wrong.id}`" class="inline-flex w-full items-center gap-2 rounded-[3px] px-2 py-1.5 text-[15px] text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-hover)] hover:text-[var(--color-text)]">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-3.5 w-3.5 shrink-0 opacity-50"><path d="M9 18l6-6-6-6"/></svg>
                  <span class="truncate">{{ wrong.title }}</span>
                </RouterLink>
              </li>
              <li v-if="!store.wrongs.length" class="py-2 text-center text-[15px] text-[var(--color-text-muted)]">暂无关联错题</li>
            </ul>
          </div>
        </div>
      </div>

      <div v-if="editing" class="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4" @click.self="editing = false">
        <form class="w-full max-w-lg space-y-4 rounded-[3px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5" @submit.prevent="save">
          <h3 class="text-xl font-semibold text-[var(--color-text)] [font-family:var(--font-heading)]">编辑笔记</h3>
          <label class="block text-[15px] text-[var(--color-text-secondary)]">
            标题
            <input v-model="form.title" aria-label="笔记标题" required maxlength="200" class="mt-1 w-full rounded-[3px] border border-[var(--color-border)] bg-transparent px-3 py-2 text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]" />
          </label>
          <label class="block text-[15px] text-[var(--color-text-secondary)]">
            内容
            <RichTextEditor v-model="form.content" class="mt-1" />
          </label>
          <p v-if="store.saveError" role="alert" class="text-sm text-[var(--danger)]">{{ store.saveError }}</p>
          <div class="flex justify-end gap-3">
            <button type="button" class="rounded-[3px] border border-[var(--color-border)] px-4 py-2 text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-hover)]" @click="editing = false">取消</button>
            <button :disabled="store.saving || !form.title.trim()" type="submit" class="rounded-[3px] bg-[var(--color-accent)] px-4 py-2 font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)] disabled:opacity-50">{{ store.saving ? '保存中…' : '保存' }}</button>
          </div>
        </form>
      </div>

      <div v-if="confirming" class="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4" @click.self="confirming = false">
        <div class="w-full max-w-sm space-y-4 rounded-[3px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <h3 class="text-xl font-semibold text-[var(--color-text)] [font-family:var(--font-heading)]">删除笔记</h3>
          <p class="text-[15px] leading-relaxed text-[var(--color-text-secondary)]">确认删除「{{ store.note.title }}」吗？此操作不可撤销。</p>
          <p v-if="store.deleteError" role="alert" class="text-sm text-[var(--danger)]">{{ store.deleteError }}</p>
          <div class="flex justify-end gap-3">
            <button type="button" class="rounded-[3px] border border-[var(--color-border)] px-4 py-2 text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-hover)]" @click="confirming = false">取消</button>
            <button :disabled="store.deleting" class="rounded-[3px] bg-[var(--danger)] px-4 py-2 font-medium text-white transition-opacity disabled:opacity-50" @click="remove">{{ store.deleting ? '删除中…' : '确认删除' }}</button>
          </div>
        </div>
      </div>
    </template>
  </section>
</template>
