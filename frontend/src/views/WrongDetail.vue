<!-- 错题详情：卡片布局、modal 编辑/删除确认、关联笔记侧栏，风格统一 ProblemDetail。 -->
<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useWrongListStore } from '../stores/wrongList';
import { useWrongNoteStore } from '../stores/wrongNote';
import { WRONG_CATEGORY_PRESETS } from '../constants';
import type { Difficulty, SolutionLink, Wrong } from '../types';
import RichTextEditor from '../components/editor/RichTextEditor.vue';
import MarkdownRenderer from '../components/editor/MarkdownRenderer.vue';

const route = useRoute();
const router = useRouter();
const wrongs = useWrongListStore();
const store = useWrongNoteStore();
const id = String(route.params.wrongId);

const wrong = ref<Wrong | null>(null);
const editing = ref(false);
const confirming = ref(false);
const selected = ref<string[]>([]);
const form = reactive({ title: '', category: '', difficulty: 'EASY' as Difficulty, review: '', links: [] as SolutionLink[] });

const DIFFICULTY_LABEL: Record<Difficulty, string> = { EASY: '简单', MEDIUM: '中等', HARD: '困难' };
const DIFFICULTY_TAG: Record<Difficulty, string> = {
  EASY: 'bg-[color-mix(in_srgb,var(--success)_12%,transparent)] text-[var(--success)]',
  MEDIUM: 'bg-[color-mix(in_srgb,var(--warning)_14%,transparent)] text-[var(--warning)]',
  HARD: 'bg-[color-mix(in_srgb,var(--danger)_12%,transparent)] text-[var(--danger)]',
};

const links = computed<SolutionLink[]>(() => (Array.isArray(wrong.value?.solutionLinks) ? (wrong.value.solutionLinks as SolutionLink[]) : []));

function edit(): void {
  if (!wrong.value) return;
  Object.assign(form, { title: wrong.value.title, category: wrong.value.category ?? '', difficulty: wrong.value.difficulty, review: wrong.value.review ?? '', links: links.value.map((link) => ({ name: link.name, url: link.url })) });
  wrongs.saveError = '';
  editing.value = true;
}
function addLink(): void { form.links.push({ name: '', url: '' }); }
function removeLink(index: number): void { form.links.splice(index, 1); }
const validLink = (link: SolutionLink): boolean => Boolean(link.name.trim()) && /^https?:\/\//.test(link.url);

async function save(): Promise<void> {
  if (!form.title.trim() || !wrong.value) return;
  const updated = await wrongs.update(id, { title: form.title, category: form.category.trim(), difficulty: form.difficulty, review: form.review, solutionLinks: form.links.filter(validLink) });
  if (updated) { wrong.value = updated; editing.value = false; }
}
async function remove(): Promise<void> {
  if (await wrongs.remove(id)) { confirming.value = false; await router.push('/wrongs'); }
}
async function saveNotes(): Promise<void> { await store.replace(id, selected.value); }
async function unlink(noteId: string): Promise<void> { await store.remove(id, noteId); selected.value = selected.value.filter((item) => item !== noteId); }

onMounted(async () => {
  wrong.value = await wrongs.get(id);
  await Promise.all([store.fetch(id), store.fetchNotes()]);
  selected.value = store.notes.map((note) => note.id);
});
</script>

<template>
  <section class="mx-auto flex w-full max-w-[1280px] flex-col">
    <p v-if="!wrong" role="status" class="py-12 text-center text-sm text-[var(--color-text-muted)]">正在加载错题详情…</p>

    <template v-else>
      <div class="mb-4 shrink-0">
        <RouterLink to="/wrongs" class="mb-2 inline-flex items-center gap-[5px] text-[15px] font-medium text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-accent)]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="h-3.5 w-3.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          返回错题列表
        </RouterLink>
        <h1 class="text-[25px] font-bold tracking-tight text-[var(--color-text)] [font-family:var(--font-heading)]">{{ wrong.title }}</h1>
        <div class="mt-2 flex flex-wrap items-center gap-2 text-[15px] text-[var(--color-text-muted)]">
          <span class="inline-flex items-center rounded-[2px] px-[7px] text-[13px] font-semibold leading-[22px]" :class="DIFFICULTY_TAG[wrong.difficulty]">{{ DIFFICULTY_LABEL[wrong.difficulty] }}</span>
          <span v-if="wrong.category" class="inline-flex items-center rounded-[2px] bg-[var(--color-accent-light)] px-[7px] text-[13px] font-semibold leading-[22px] text-[var(--color-accent)]">{{ wrong.category }}</span>
        </div>
      </div>

      <div class="grid items-start gap-2 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)]">
        <div class="flex min-w-0 flex-col gap-2">
          <div class="rounded-[3px] border border-[var(--color-border)] bg-[var(--color-surface)] p-3.5">
            <div class="mb-3 flex items-center gap-2">
              <span class="text-[17px] font-semibold text-[var(--color-text)] [font-family:var(--font-heading)]">错因复盘</span>
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
            <MarkdownRenderer v-if="wrong.review" :content="wrong.review" />
            <p v-else class="py-4 text-center text-[15px] text-[var(--color-text-muted)]">暂无错因复盘，点击「编辑」补充。</p>
          </div>

          <div class="rounded-[3px] border border-[var(--color-border)] bg-[var(--color-surface)] p-3.5">
            <div class="mb-3 flex items-center gap-2">
              <span class="text-[17px] font-semibold text-[var(--color-text)] [font-family:var(--font-heading)]">题解链接</span>
            </div>
            <ul v-if="links.length" class="space-y-2">
              <li v-for="(link, index) in links" :key="index">
                <a :href="link.url" target="_blank" rel="noopener noreferrer" class="inline-flex w-full items-center gap-2 rounded-[3px] px-2 py-1.5 text-[15px] text-[var(--color-accent)] transition-colors hover:bg-[var(--color-hover)]">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-3.5 w-3.5 shrink-0"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                  <span class="truncate">{{ link.name }}</span>
                </a>
              </li>
            </ul>
            <p v-else class="py-2 text-center text-[15px] text-[var(--color-text-muted)]">暂无题解链接。</p>
          </div>
        </div>

        <div class="flex min-w-0 flex-col gap-2">
          <div class="rounded-[3px] border border-[var(--color-border)] bg-[var(--color-surface)] p-3.5">
            <div class="mb-3 flex items-center gap-2">
              <span class="text-[17px] font-semibold text-[var(--color-text)] [font-family:var(--font-heading)]">关联笔记</span>
            </div>
            <ul class="space-y-2">
              <li v-for="note in store.notes" :key="note.id" class="flex items-center justify-between gap-2 rounded-[3px] px-2 py-1.5 transition-colors hover:bg-[var(--color-hover)]">
                <RouterLink :to="`/notes/${note.id}`" class="min-w-0 truncate text-[15px] text-[var(--color-text-secondary)] hover:text-[var(--color-accent)]">{{ note.title }}</RouterLink>
                <button class="shrink-0 text-[13px] text-[var(--danger)] hover:opacity-80" @click="unlink(note.id)">解除</button>
              </li>
              <li v-if="!store.notes.length" class="py-2 text-center text-[15px] text-[var(--color-text-muted)]">暂无关联笔记</li>
            </ul>
          </div>

          <div class="rounded-[3px] border border-[var(--color-border)] bg-[var(--color-surface)] p-3.5">
            <div class="mb-3 flex items-center gap-2">
              <span class="text-[17px] font-semibold text-[var(--color-text)] [font-family:var(--font-heading)]">替换关联</span>
            </div>
            <select v-model="selected" multiple aria-label="选择关联笔记" class="w-full rounded-[3px] border border-[var(--color-border)] bg-transparent px-3 py-2 text-[15px] text-[var(--color-text-secondary)] outline-none focus:border-[var(--color-accent)]">
              <option v-for="note in store.allNotes" :key="note.id" :value="note.id">{{ note.title }}</option>
            </select>
            <p class="mt-2 text-[13px] text-[var(--color-text-muted)]">按住 Ctrl/Cmd 多选，保存后整体替换。</p>
            <p v-if="store.error" role="alert" class="mt-2 text-sm text-[var(--danger)]">{{ store.error }}</p>
            <button class="mt-3 inline-flex w-full items-center justify-center gap-[6px] rounded-[3px] bg-[var(--color-accent)] px-3.5 py-2 text-[15px] font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)]" @click="saveNotes">保存关联</button>
          </div>
        </div>
      </div>

      <div v-if="editing" class="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4" @click.self="editing = false">
        <form class="w-full max-w-3xl space-y-4 rounded-[3px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5" @submit.prevent="save">
          <h3 class="text-xl font-semibold text-[var(--color-text)] [font-family:var(--font-heading)]">编辑错题</h3>
          <label class="block text-[15px] text-[var(--color-text-secondary)]">
            标题
            <input v-model="form.title" aria-label="错题标题" required maxlength="255" class="mt-1 w-full rounded-[3px] border border-[var(--color-border)] bg-transparent px-3 py-2 text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]" />
          </label>
          <label class="block text-[15px] text-[var(--color-text-secondary)]">
            分类
            <input v-model="form.category" aria-label="错题分类" list="wrong-detail-category-presets" maxlength="100" class="mt-1 w-full rounded-[3px] border border-[var(--color-border)] bg-transparent px-3 py-2 text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]" />
            <datalist id="wrong-detail-category-presets"><option v-for="preset in WRONG_CATEGORY_PRESETS" :key="preset" :value="preset" /></datalist>
          </label>
          <label class="block text-[15px] text-[var(--color-text-secondary)]">
            难度
            <select v-model="form.difficulty" aria-label="错题难度" class="mt-1 w-full rounded-[3px] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]">
              <option value="EASY">简单</option>
              <option value="MEDIUM">中等</option>
              <option value="HARD">困难</option>
            </select>
          </label>
          <label class="block text-[15px] text-[var(--color-text-secondary)]">
            错因复盘
            <RichTextEditor v-model="form.review" class="mt-1" />
          </label>
          <fieldset class="space-y-2">
            <legend class="text-[15px] font-semibold text-[var(--color-text-secondary)]">题解链接</legend>
            <div v-for="(link, index) in form.links" :key="index" class="flex flex-wrap gap-2">
              <input v-model="link.name" aria-label="链接名称" placeholder="名称" maxlength="100" class="min-w-0 flex-1 rounded-[3px] border border-[var(--color-border)] bg-transparent px-3 py-2 text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]" />
              <input v-model="link.url" aria-label="链接地址" placeholder="https:// 开头" class="min-w-0 flex-1 rounded-[3px] border border-[var(--color-border)] bg-transparent px-3 py-2 text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]" />
              <button type="button" class="rounded-[3px] px-3 py-2 text-[15px] text-[var(--danger)] transition-colors hover:bg-[color-mix(in_srgb,var(--danger)_12%,transparent)]" @click="removeLink(index)">移除</button>
            </div>
            <button type="button" class="inline-flex items-center gap-[5px] rounded-[3px] border border-[var(--color-border)] px-3 py-2 text-[15px] text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-hover)]" @click="addLink">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-3.5 w-3.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              添加链接
            </button>
            <p class="text-[13px] text-[var(--color-text-muted)]">保存时自动忽略名称为空或地址不是 http(s) 开头的行。</p>
          </fieldset>
          <p v-if="wrongs.saveError" role="alert" class="text-sm text-[var(--danger)]">{{ wrongs.saveError }}</p>
          <div class="flex justify-end gap-3">
            <button type="button" class="rounded-[3px] border border-[var(--color-border)] px-4 py-2 text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-hover)]" @click="editing = false">取消</button>
            <button :disabled="wrongs.saving || !form.title.trim()" type="submit" class="rounded-[3px] bg-[var(--color-accent)] px-4 py-2 font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)] disabled:opacity-50">{{ wrongs.saving ? '保存中…' : '保存' }}</button>
          </div>
        </form>
      </div>

      <div v-if="confirming" class="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4" @click.self="confirming = false">
        <div class="w-full max-w-sm space-y-4 rounded-[3px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <h3 class="text-xl font-semibold text-[var(--color-text)] [font-family:var(--font-heading)]">删除错题</h3>
          <p class="text-[15px] leading-relaxed text-[var(--color-text-secondary)]">确认删除「{{ wrong.title }}」吗？此操作不可撤销。</p>
          <p v-if="wrongs.deleteError" role="alert" class="text-sm text-[var(--danger)]">{{ wrongs.deleteError }}</p>
          <div class="flex justify-end gap-3">
            <button type="button" class="rounded-[3px] border border-[var(--color-border)] px-4 py-2 text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-hover)]" @click="confirming = false">取消</button>
            <button :disabled="wrongs.deleting" class="rounded-[3px] bg-[var(--danger)] px-4 py-2 font-medium text-white transition-opacity disabled:opacity-50" @click="remove">{{ wrongs.deleting ? '删除中…' : '确认删除' }}</button>
          </div>
        </div>
      </div>
    </template>
  </section>
</template>
