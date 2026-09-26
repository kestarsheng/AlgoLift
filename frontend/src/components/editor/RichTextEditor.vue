<!-- 富文本编辑器：基于 Tiptap，支持图片上传/粘贴/拖拽、Mermaid 实时预览、表格、代码块语言选择，输出 Markdown。 -->
<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { Editor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { Table, TableRow, TableCell, TableHeader } from '@tiptap/extension-table';
import { Markdown } from 'tiptap-markdown';
import { createLowlight, common } from 'lowlight';
import { uploadImage } from '../../api';

const lowlight = createLowlight(common);

const props = defineProps<{ modelValue: string; placeholder?: string }>();
const emit = defineEmits<{ 'update:modelValue': [value: string] }>();

const tick = ref(0);
const uploading = ref(false);
const uploadError = ref<string | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);

const editor = new Editor({
  extensions: [
    StarterKit.configure({ codeBlock: false }),
    Link.configure({ openOnClick: false, autolink: true, HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' } }),
    Image,
    CodeBlockLowlight.configure({ lowlight }),
    Table.configure({ resizable: true }),
    TableRow,
    TableCell,
    TableHeader,
    Markdown.configure({ html: true, breaks: true, transformPastedText: true, transformCopiedText: true }),
  ],
  content: props.modelValue,
  onUpdate: () => emit('update:modelValue', editor.storage.markdown.getMarkdown()),
  onTransaction: () => { tick.value++; },
  editorProps: {
    handlePaste: (_view, event) => handlePaste(null, event),
    handleDrop: (_view, event, _pos) => handleDrop(null, event, 0),
  },
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

const insertImageFromFile = async (file: File): Promise<void> => {
  if (!file.type.startsWith('image/')) return;
  uploading.value = true;
  uploadError.value = null;
  try {
    const url = await uploadImage(file);
    editor.chain().focus().setImage({ src: url }).run();
  } catch (e) {
    uploadError.value = (e as Error).message;
  } finally {
    uploading.value = false;
  }
};

const triggerFileInput = (): void => { fileInput.value?.click(); };
const onFileChange = (e: Event): void => {
  const target = e.target as HTMLInputElement;
  if (target.files?.[0]) void insertImageFromFile(target.files[0]);
  target.value = '';
};

const handlePaste = (_view: unknown, event: ClipboardEvent): boolean => {
  const items = event.clipboardData?.items;
  if (!items) return false;
  for (const item of items) {
    if (item.type.startsWith('image/')) {
      const file = item.getAsFile();
      if (file) { void insertImageFromFile(file); return true; }
    }
  }
  return false;
};

const handleDrop = (_view: unknown, event: DragEvent, _pos: number): boolean => {
  const files = event.dataTransfer?.files;
  if (!files?.length) return false;
  for (const file of files) {
    if (file.type.startsWith('image/')) { void insertImageFromFile(file); return true; }
  }
  return false;
};


const insertMermaid = (): void => {
  editor.chain().focus().toggleCodeBlock().run();
  editor.chain().focus().setNode('codeBlock', { language: 'mermaid' }).run();
};

const currentMermaidCode = computed<string | null>(() => {
  if (!editor.isActive('codeBlock')) return null;
  const attrs = editor.getAttributes('codeBlock');
  if (attrs.language !== 'mermaid') return null;
  const { from, to } = editor.state.selection;
  return editor.state.doc.textBetween(from, to, '\n');
});

const mermaidSvg = ref<string | null>(null);
const mermaidLoading = ref(false);
let mermaidPromise: Promise<typeof import('mermaid')['default']> | null = null;
const loadMermaid = (): Promise<typeof import('mermaid')['default']> => {
  if (!mermaidPromise) mermaidPromise = import('mermaid').then((mod) => { mod.default.initialize({ startOnLoad: false, theme: 'neutral', securityLevel: 'strict' }); return mod.default; });
  return mermaidPromise;
};

watch(currentMermaidCode, async (code) => {
  if (!code) { mermaidSvg.value = null; return; }
  mermaidLoading.value = true;
  try {
    const mermaid = await loadMermaid();
    const { svg } = await mermaid.render(`mermaid-preview-${Date.now()}`, code);
    mermaidSvg.value = svg;
  } catch {
    mermaidSvg.value = null;
  } finally {
    mermaidLoading.value = false;
  }
}, { immediate: true });

const codeLanguages = ['plaintext', 'javascript', 'typescript', 'python', 'java', 'c', 'cpp', 'go', 'rust', 'sql', 'json', 'yaml', 'bash', 'html', 'css', 'mermaid'];
const currentCodeLang = computed<string>(() => (editor.getAttributes('codeBlock').language as string) ?? 'plaintext');
const setCodeLang = (lang: string): void => { editor.chain().focus().setNode('codeBlock', { language: lang }).run(); };

const insertTable = (): void => {
  editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
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
      <button type="button" :class="[btn, editor.isActive('blockquote') ? btnActive : '']" title="引用" @click="run(() => editor.chain().focus().toggleBlockquote().run())">"</button>
      <button type="button" :class="[btn, editor.isActive('codeBlock') ? btnActive : '']" title="代码块" @click="run(() => editor.chain().focus().toggleCodeBlock().run())">&lt;/&gt;</button>
      <button type="button" :class="[btn, editor.isActive('codeBlock') && currentCodeLang === 'mermaid' ? btnActive : '']" title="Mermaid 图表" @click="insertMermaid">M</button>
      <span class="mx-0.5 h-4 w-px bg-[var(--color-border)]" />
      <button type="button" :class="[btn, editor.isActive('link') ? btnActive : '']" title="链接" @click="setLink">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
      </button>
      <button type="button" :class="btn" title="上传图片" @click="triggerFileInput">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
      </button>
      <span class="mx-0.5 h-4 w-px bg-[var(--color-border)]" />
      <button type="button" :class="[btn, editor.isActive('table') ? btnActive : '']" title="插入表格" @click="insertTable">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>
      </button>
      <template v-if="editor.isActive('table')">
        <button type="button" :class="btn" title="增加行" @click="run(() => editor.chain().focus().addRowAfter().run())">+行</button>
        <button type="button" :class="btn" title="删除行" @click="run(() => editor.chain().focus().deleteRow().run())">-行</button>
        <button type="button" :class="btn" title="增加列" @click="run(() => editor.chain().focus().addColumnAfter().run())">+列</button>
        <button type="button" :class="btn" title="删除列" @click="run(() => editor.chain().focus().deleteColumn().run())">-列</button>
      </template>
      <template v-if="editor.isActive('codeBlock')">
        <span class="mx-0.5 h-4 w-px bg-[var(--color-border)]" />
        <select :value="currentCodeLang" class="h-[30px] rounded-[3px] border border-[var(--color-border)] bg-[var(--color-surface)] px-1 text-[13px] text-[var(--color-text-secondary)]" @change="setCodeLang(($event.target as HTMLSelectElement).value)">
          <option v-for="lang in codeLanguages" :key="lang" :value="lang">{{ lang }}</option>
        </select>
      </template>
    </div>
    <div v-if="uploading" class="px-4 py-1 text-[13px] text-[var(--color-text-muted)]">上传中…</div>
    <div v-if="uploadError" class="px-4 py-1 text-[13px] text-[var(--error)]">{{ uploadError }}</div>
    <div v-if="mermaidSvg" class="border-b border-[var(--color-border)] px-4 py-2" v-html="mermaidSvg" />
    <div v-else-if="mermaidLoading" class="border-b border-[var(--color-border)] px-4 py-2 text-[13px] text-[var(--color-text-muted)]">渲染图表中…</div>
    <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="onFileChange" />
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
.rich-text-editor__content :deep(table) { border-collapse: collapse; margin: 0 0 0.6em; width: 100%; }
.rich-text-editor__content :deep(th), .rich-text-editor__content :deep(td) { border: 1px solid var(--color-border); padding: 0.35em 0.6em; }
.rich-text-editor__content :deep(th) { background: var(--color-hover); font-weight: 600; }
.rich-text-editor__content :deep(.hljs-keyword) { color: var(--color-accent); }
.rich-text-editor__content :deep(.hljs-string) { color: var(--success); }
.rich-text-editor__content :deep(.hljs-number) { color: var(--warning); }
.rich-text-editor__content :deep(.hljs-comment) { color: var(--color-text-muted); font-style: italic; }
.rich-text-editor__content :deep(.hljs-title) { color: var(--color-accent); }
.rich-text-editor__content :deep(.hljs-built_in) { color: var(--color-text-secondary); }
</style>
