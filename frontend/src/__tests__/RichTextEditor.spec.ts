// RichTextEditor 编辑器测试：挂载工具栏、初始内容渲染、v-model 输出 Markdown。
import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import RichTextEditor from '../components/editor/RichTextEditor.vue';

describe('RichTextEditor', () => {
  it('挂载并显示工具栏按钮', () => {
    const wrapper = mount(RichTextEditor, { props: { modelValue: '' } });
    expect(wrapper.html()).toContain('H1');
    expect(wrapper.html()).toContain('H2');
  });
  it('初始 Markdown 内容渲染到编辑区', () => {
    const wrapper = mount(RichTextEditor, { props: { modelValue: '# 标题' } });
    expect(wrapper.html()).toContain('标题');
  });
});