<!-- Markdown 渲染器：将 Markdown 文本渲染为 HTML，DOMPurify 清洗防 XSS，识别 ```mermaid 代码块并渲染为图表。 -->
<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

const props = defineProps<{ content: string | null }>();
const root = ref<HTMLElement | null>(null);

let mermaidPromise: Promise<typeof import('mermaid')['default']> | null = null;
const loadMermaid = (): Promise<typeof import('mermaid')['default']> => {
  if (!mermaidPromise) mermaidPromise = import('mermaid').then((mod) => { mod.default.initialize({ startOnLoad: false, theme: 'neutral', securityLevel: 'strict' }); return mod.default; });
  return mermaidPromise;
};

const renderMermaidBlocks = async (container: HTMLElement): Promise<void> => {
  const blocks = container.querySelectorAll('code.language-mermaid');
  if (!blocks.length) return;
  const mermaid = await loadMermaid();
  blocks.forEach((block) => {
    const code = block.textContent ?? '';
    const id = `mermaid-${Math.random().toString(36).slice(2)}`;
    mermaid.render(id, code).then(({ svg }) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'mermaid-svg';
      wrapper.innerHTML = svg;
      block.parentElement?.replaceWith(wrapper);
    }).catch(() => { /* 渲染失败的 mermaid 块保留原代码 */ });
  });
};

const render = async (): Promise<void> => {
  if (!root.value) return;
  const raw = (props.content ?? '').trim();
  if (!raw) { root.value.innerHTML = ''; return; }
  const html = DOMPurify.sanitize(marked.parse(raw, { breaks: true, gfm: true, async: false }) as string, { ADD_ATTR: ['target', 'rel'] });
  root.value.innerHTML = html;
  await renderMermaidBlocks(root.value);
};

onMounted(() => { void render(); });
watch(() => props.content, () => { void nextTick(() => render()); });
</script>

<template>
  <div ref="root" class="markdown-renderer" />
</template>

<style scoped>
.markdown-renderer { font-size: 16px; line-height: 1.7; color: var(--color-text-secondary); word-break: break-word; }
.markdown-renderer :deep(h1) { font-size: 25px; font-weight: 700; margin: 0.6em 0 0.3em; color: var(--color-text); font-family: var(--font-heading); }
.markdown-renderer :deep(h2) { font-size: 21px; font-weight: 700; margin: 0.6em 0 0.3em; color: var(--color-text); font-family: var(--font-heading); }
.markdown-renderer :deep(h3) { font-size: 17px; font-weight: 600; margin: 0.5em 0 0.25em; color: var(--color-text); font-family: var(--font-heading); }
.markdown-renderer :deep(h4) { font-size: 17px; font-weight: 600; margin: 0.5em 0 0.25em; color: var(--color-text); }
.markdown-renderer :deep(p) { margin: 0 0 0.6em; }
.markdown-renderer :deep(ul) { list-style: disc; padding-left: 1.5em; margin: 0 0 0.6em; }
.markdown-renderer :deep(ol) { list-style: decimal; padding-left: 1.5em; margin: 0 0 0.6em; }
.markdown-renderer :deep(li) { margin: 0 0 0.2em; }
.markdown-renderer :deep(blockquote) { border-left: 3px solid var(--color-accent); padding-left: 0.9em; margin: 0 0 0.6em; color: var(--color-text-muted); }
.markdown-renderer :deep(pre) { background: var(--color-hover); border-radius: 3px; padding: 0.75em 1em; margin: 0 0 0.6em; overflow-x: auto; }
.markdown-renderer :deep(code) { font-family: var(--font-mono, 'JetBrains Mono', monospace); font-size: 0.9em; }
.markdown-renderer :deep(pre code) { color: var(--color-text); }
.markdown-renderer :deep(:not(pre) > code) { background: var(--color-hover); border-radius: 2px; padding: 0.1em 0.35em; color: var(--color-text); }
.markdown-renderer :deep(a) { color: var(--color-accent); text-decoration: underline; }
.markdown-renderer :deep(img) { max-width: 100%; border-radius: 3px; }
.markdown-renderer :deep(table) { border-collapse: collapse; margin: 0 0 0.6em; }
.markdown-renderer :deep(th), .markdown-renderer :deep(td) { border: 1px solid var(--color-border); padding: 0.35em 0.6em; }
.markdown-renderer :deep(.mermaid-svg) { display: flex; justify-content: center; margin: 0 0 0.6em; }
.markdown-renderer :deep(.hljs-keyword) { color: var(--color-accent); }
.markdown-renderer :deep(.hljs-string) { color: var(--success); }
.markdown-renderer :deep(.hljs-number) { color: var(--warning); }
.markdown-renderer :deep(.hljs-comment) { color: var(--color-text-muted); font-style: italic; }
.markdown-renderer :deep(.hljs-title) { color: var(--color-accent); }
.markdown-renderer :deep(.hljs-built_in) { color: var(--color-text-secondary); }
</style>