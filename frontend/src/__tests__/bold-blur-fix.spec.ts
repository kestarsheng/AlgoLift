import { describe, expect, it } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { nextTick } from 'vue';
import { EditorContent, type Editor } from '@tiptap/vue-3';
import RichTextEditor from '../components/editor/RichTextEditor.vue';

function getEditor(wrapper: VueWrapper): Editor {
  return wrapper.findComponent(EditorContent).props('editor') as Editor;
}

describe('RichTextEditor bold blur 修复', () => {
  it('点击 B 后 blur 编辑区，B 按钮不再显示激活态', async () => {
    const wrapper = mount(RichTextEditor, { props: { modelValue: '' } });
    const editor = getEditor(wrapper);

    editor.commands.focus('end');
    editor.commands.toggleBold();
    await nextTick();

    const boldBtn = wrapper.find('button[title="加粗"]');
    expect(boldBtn.classes()).toContain('bg-[var(--color-accent-light)]');

    editor.view.dom.dispatchEvent(new FocusEvent('blur', { bubbles: false }));
    await nextTick();

    expect(boldBtn.classes()).not.toContain('bg-[var(--color-accent-light)]');
    wrapper.unmount();
  });

  it('blur 后重新 focus，B 按钮仍不激活', async () => {
    const wrapper = mount(RichTextEditor, { props: { modelValue: '' } });
    const editor = getEditor(wrapper);

    editor.commands.focus('end');
    editor.commands.toggleBold();
    editor.view.dom.dispatchEvent(new FocusEvent('blur', { bubbles: false }));
    editor.commands.focus('end');
    await nextTick();

    const boldBtn = wrapper.find('button[title="加粗"]');
    expect(boldBtn.classes()).not.toContain('bg-[var(--color-accent-light)]');
    wrapper.unmount();
  });
});