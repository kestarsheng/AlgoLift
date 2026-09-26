// MarkdownRenderer 渲染测试：标题/加粗/代码块/XSS 清洗/Mermaid 不崩溃。
import { describe, expect, it } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import MarkdownRenderer from '../components/editor/MarkdownRenderer.vue';

const render = async (content: string): Promise<ReturnType<typeof mount>> => {
  const wrapper = mount(MarkdownRenderer, { props: { content } });
  await flushPromises();
  await flushPromises();
  return wrapper;
};

describe('MarkdownRenderer', () => {
  it('渲染标题与加粗', async () => {
    const wrapper = await render('# 标题\n\n**加粗**');
    expect(wrapper.html()).toContain('<h1');
    expect(wrapper.html()).toContain('<strong');
  });
  it('渲染代码块', async () => {
    const wrapper = await render('```js\nconst x = 1;\n```');
    expect(wrapper.html()).toContain('<pre');
    expect(wrapper.html()).toContain('<code');
  });
  it('清洗 script 标签', async () => {
    const wrapper = await render('正文 <script>alert(1)</script>');
    expect(wrapper.html()).not.toContain('<script');
    expect(wrapper.html()).toContain('正文');
  });
  it('空内容渲染空容器', async () => {
    const wrapper = await render('');
    expect(wrapper.find('.markdown-renderer').exists()).toBe(true);
  });
  it('含 mermaid 块不崩溃', async () => {
    const wrapper = await render('```mermaid\ngraph TD\nA-->B\n```');
    expect(wrapper.find('.markdown-renderer').exists()).toBe(true);
  });
});