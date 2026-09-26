<!-- 富文本编辑器：基于 Tiptap，工具栏支持加粗/斜体/标题/列表/引用/代码块/链接/图片，输出 Markdown。 -->
<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue';
import { Editor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { Markdown } from 'tiptap-markdown';
import { createLowlight, common } from 'lowlight';

const lowlight = createLowlight(common);

const props = defineProps<{ modelValue: string; placeholder?: string }>();
const emit = defineEmits<{ 'update:modelValue': [value: string] }>();

const tick = ref(0);
const editor = new Editor({
  extensions: [
    StarterKit.configure({ codeBlock: false }),
    Link.configure({ openOnClick: false, autolink: true, HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' } }),
    Image,
    CodeBlockLowlight.configure({ lowlight }),
    Markdown.configure({ html: true, breaks: true, transformPastedText: true, transformCopiedText: true }),
  ],
  content: props.modelValue,
  onUpdate: () => emit('update:modelValue', editor.storage.markdown.getMarkdown()),
  onTransaction: () => { tick.value++; },
});

watch(() => props.modelValue, (value: string) => {
  if (editor.storage.markdown.getMarkdown() !== value) editor.commands.setContent(value || '', { emitUpdate: false });
});

onBeforeUnmount(() => editor.destroy());

const run = (command: () => void): void => command();
const setLink = (): void => {
  const previous = editor.getAttributes('link').href as string | undefined;
  const url = window.prompt('链接地址（留空取消链接）', previous ?? 'https://');
  if (url === null) return;
  if (url === '') { editor.chain().focus().extendMarkRange('link').unsetLink().run(); return; }
  editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
};
const addImage = (): void => {
  const url = window.prompt('图片地址', 'https://');
  if (!url) return;
  editor.chain().focus().setImage({ src: url }).run();
};
const btn = 'inline-flex h-[30px] w-[30px] items-center justify-center rounded-[3px] text-[15px] font-medium text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-hover)] hover:text-[var(--color-text)]';
const btnActive = 'bg-[var(--color-accent-light)] text-[var(--color-accent)]';
</script>

<template>
  <div class="overflow-hidden rounded-[3px] border border-[var(--color-border)] bg-[var(--color-surface)]">
    <div class="flex flex-wrap items-center gap-1 border-b border-[var(--color-border)] px-2 py-1.5" :data-tick="tick">
      <button type="button" :class="[btn, editor.isActive('bold') ? btnActive : '']" title="加粗" @click="run(() => editor.chain().focus().toggleBold().run())"><span class="font-bold">B</span></button>
      <button type="button" :class="[btn, editor.isActive('italic') ? btnActive : '']" title="斜体" @click="run(() => editor.chain().focus().toggleItalic().run())"><span class="italic font-serif">I</span></button>
      <span class="mx-0.5 h-4 w-px bg-[var(--color-border)]" />
      <button type="button" :class="[btn, editor.isActive('heading', { level: 1 }) ? btnActive : '']" title="一级标题" @click="run(() => editor.chain().focus().toggleHeading({ level: 1 }).run())">H1</button>
      <button type="button" :class="[btn, editor.isActive('heading', { level: 2 }) ? btnActive : '']" title="二级标题" @click="run(() => editor.chain().focus().toggleHeading({ level: 2 }).run())">H2</button>
      <button type="button" :class="[btn, editor.isActive('heading', { level: 3 }) ? btnActive : '']" title="三级标题" @click="run(() => editor.chain().focus().toggleHeading({ level: 3 }).run())">H3</button>
      <span class="mx-0.5 h-4 w-px bg-[var(--color-border)]" />
      <button type="button" :class="[btn, editor.isActive('bulletList') ? btnActive : '']" title="无序列表" @click="run(() => editor.chain().focus().toggleBulletList().run())">•</button>
      <button type="button" :class="[btn, editor.isActive('orderedList') ? btnActive : '']" title="有序列表" @click="run(() => editor.chain().focus().toggleOrderedList().run())">1.</button>
      <button type="button" :class="[btn, editor.isActive('blockquote') ? btnActive : '']" title="引用" @click="run(() => editor.chain().focus().toggleBlockquote().run())">“</button>
      <button type="button" :class="[btn, editor.isActive('codeBlock') ? btnActive : '']" title="代码块" @click="run(() => editor.chain().focus().toggleCodeBlock().run())">&lt;/&gt;</button>
      <span class="mx-0.5 h-4 w-px bg-[var(--color-border)]" />
      <button type="button" :class="[btn, editor.isActive('link') ? btnActive : '']" title="链接" @click="setLink">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
      </button>
      <button type="button" :class="btn" title="图片" @click="addImage">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
      </button>
    </div>
    <EditorContent :editor="editor" class="rich-text-editor__content px-4 py-3" />
  </div>
</template>

<style scoped>
.rich-text-editor__content :deep(.ProseMirror) {
  min-height: 120px;
  outline: none;
  font-size: 16px;
  line-height: 1.7;
  color: var(--color-text);
}
.rich-text-editor__content :deep(.ProseMirror.is-editor-empty:first-child::before) {
  content: attr(data-placeholder);
  float: left;
  color: var(--color-text-muted);
  pointer-events: none;
  height: 0;
}
.rich-text-editor__content :deep(h1) { font-size: 25px; font-weight: 700; margin: 0.6em 0 0.3em; font-family: var(--font-heading); }
.rich-text-editor__content :deep(h2) { font-size: 21px; font-weight: 700; margin: 0.6em 0 0.3em; font-family: var(--font-heading); }
.rich-text-editor__content :deep(h3) { font-size: 17px; font-weight: 600; margin: 0.5em 0 0.25em; font-family: var(--font-heading); }
.rich-text-editor__content :deep(p) { margin: 0 0 0.6em; }
.rich-text-editor__content :deep(ul) { list-style: disc; padding-left: 1.5em; margin: 0 0 0.6em; }
.rich-text-editor__content :deep(ol) { list-style: decimal; padding-left: 1.5em; margin: 0 0 0.6em; }
.rich-text-editor__content :deep(li) { margin: 0 0 0.2em; }
.rich-text-editor__content :deep(blockquote) { border-left: 3px solid var(--color-accent); padding-left: 0.9em; margin: 0 0 0.6em; color: var(--color-text-secondary); }
.rich-text-editor__content :deep(pre) { background: var(--color-hover); border-radius: 3px; padding: 0.75em 1em; margin: 0 0 0.6em; overflow-x: auto; }
.rich-text-editor__content :deep(code) { font-family: var(--font-mono, 'JetBrains Mono', monospace); font-size: 0.9em; }
.rich-text-editor__content :deep(pre code) { color: var(--color-text); background: none; padding: 0; }
.rich-text-editor__content :deep(:not(pre) > code) { background: var(--color-hover); border-radius: 2px; padding: 0.1em 0.35em; }
.rich-text-editor__content :deep(a) { color: var(--color-accent); text-decoration: underline; }
.rich-text-editor__content :deep(img) { max-width: 100%; border-radius: 3px; }
.rich-text-editor__content :deep(.hljs-keyword) { color: var(--color-accent); }
.rich-text-editor__content :deep(.hljs-string) { color: var(--success); }
.rich-text-editor__content :deep(.hljs-number) { color: var(--warning); }
.rich-text-editor__content :deep(.hljs-comment) { color: var(--color-text-muted); font-style: italic; }
.rich-text-editor__content :deep(.hljs-title) { color: var(--color-accent); }
.rich-text-editor__content :deep(.hljs-built_in) { color: var(--color-text-secondary); }
</style>