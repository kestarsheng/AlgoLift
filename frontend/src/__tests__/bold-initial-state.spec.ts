import { describe, expect, it } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { nextTick } from 'vue';
import { EditorContent, type Editor } from '@tiptap/vue-3';
import RichTextEditor from '../components/editor/RichTextEditor.vue';

const ACTIVE = 'bg-[var(--color-accent-light)]';

function mountEditor(content: string): { wrapper: VueWrapper; editor: Editor; boldBtn: () => ReturnType<VueWrapper['find']> } {
  const wrapper = mount(RichTextEditor, { props: { modelValue: content } });
  const editor = wrapper.findComponent(EditorContent).props('editor') as Editor;
  return { wrapper, editor, boldBtn: () => wrapper.find('button[title="加粗"]') };
}

describe('RichTextEditor 初始光标不落在加粗文本上', () => {
  it('内容以加粗文本开头时，打开编辑框 B 不高亮', async () => {
    const { wrapper, editor, boldBtn } = mountEditor('**重点说明**\n\n普通段落');
    await nextTick();
    expect(editor.state.selection.from).toBeGreaterThan(0);
    expect(editor.isActive('bold')).toBe(false);
    expect(boldBtn().classes()).not.toContain(ACTIVE);
    wrapper.unmount();
  });

  it('内容为空时 B 不高亮', async () => {
    const { wrapper, boldBtn } = mountEditor('');
    await nextTick();
    expect(boldBtn().classes()).not.toContain(ACTIVE);
    wrapper.unmount();
  });

  it('软文本开头时初始光标移到末尾且 B 不高亮', async () => {
    const { wrapper, editor, boldBtn } = mountEditor('普通段落内容');
    await nextTick();
    expect(editor.isActive('bold')).toBe(false);
    expect(boldBtn().classes()).not.toContain(ACTIVE);
    wrapper.unmount();
  });

  it('光标手动移到已有加粗文本上时 B 高亮（标准行为保留）', async () => {
    const { wrapper, editor, boldBtn } = mountEditor('**加粗段**\n\n普通段落');
    await nextTick();
    let boldPos = -1;
    editor.state.doc.nodesBetween(0, editor.state.doc.content.size, (node, pos) => {
      if (boldPos === -1 && node.isText && node.marks.some((m) => m.type.name === 'bold')) boldPos = pos;
    });
    expect(boldPos).toBeGreaterThan(-1);
    editor.commands.setTextSelection({ from: boldPos + 1, to: boldPos + 1 });
    editor.commands.focus();
    await nextTick();
    expect(editor.isActive('bold')).toBe(true);
    expect(boldBtn().classes()).toContain(ACTIVE);
    wrapper.unmount();
  });
});