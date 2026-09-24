// 分类看板迁移测试：分类渲染、跳转、新建/编辑/删除交互。
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createMemoryHistory } from 'vue-router';
import { createApp, h } from 'vue';
import CategoryBoard from '../views/CategoryBoard.vue';
import { api } from '../api';
import type { Category } from '../types';

vi.mock('../api', () => ({ api: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() } }));

const router = createRouter({ history: createMemoryHistory(), routes: [
  { path: '/categories', name: 'categories', component: CategoryBoard },
  { path: '/categories/:categoryId/problems', name: 'problems', component: { template: '<div />' } },
] });

const categories: Category[] = [
  { id: 'c1', name: '数组', problemCount: 12 },
  { id: 'c2', name: '动态规划', problemCount: 0 },
];

const mocked = api as unknown as { get: ReturnType<typeof vi.fn>; post: ReturnType<typeof vi.fn>; patch: ReturnType<typeof vi.fn>; delete: ReturnType<typeof vi.fn> };

const mountBoard = async () => {
  const wrapper = mount(CategoryBoard, { global: { plugins: [router] } });
  await flushPromises();
  return wrapper;
};

beforeEach(() => {
  setActivePinia(createPinia());
  const app = createApp({ render: () => h('div') });
  app.use(createPinia());
  mocked.get.mockReset().mockResolvedValue({ data: { data: categories } });
  mocked.post.mockReset().mockResolvedValue({ data: { data: { id: 'c3', name: '树', problemCount: 0 } } });
  mocked.patch.mockReset().mockResolvedValue({ data: { data: { id: 'c1', name: '数组进阶', problemCount: 12 } } });
  mocked.delete.mockReset().mockResolvedValue({ data: {} });
  vi.stubGlobal('confirm', vi.fn(() => true));
});

describe('CategoryBoard', () => {
  it('渲染分类卡片并显示汇总数量', async () => {
    const wrapper = await mountBoard();
    const cards = wrapper.findAll('.truncate.text-\\[17px\\]');
    expect(cards.map((card) => card.text())).toEqual(['数组', '动态规划']);
    expect(wrapper.text()).toContain('2');
    expect(wrapper.text()).toContain('12');
  });

  it('请求分类时带上 includeEmpty 以便展示空分类', async () => {
    await mountBoard();
    expect(mocked.get).toHaveBeenCalledWith('/categories', { params: { includeEmpty: true } });
  });

  it('空态展示新建分类引导', async () => {
    mocked.get.mockResolvedValue({ data: { data: [] } });
    const wrapper = await mountBoard();
    expect(wrapper.text()).toContain('还没有分类');
    expect(wrapper.text()).toContain('新建分类');
  });

  it('加载失败时展示错误态与重试按钮', async () => {
    mocked.get.mockRejectedValue(new Error('网络异常'));
    const wrapper = await mountBoard();
    expect(wrapper.text()).toContain('加载分类失败');
    expect(wrapper.text()).toContain('网络异常');
  });

  it('点击卡片跳转到该分类的题目列表', async () => {
    const wrapper = await mountBoard();
    const push = vi.spyOn(router, 'push');
    await wrapper.find('[role="link"]').trigger('click');
    expect(push).toHaveBeenCalledWith('/categories/c1/problems');
  });

  it('新建分类提交后关闭模态框并刷新列表', async () => {
    const wrapper = await mountBoard();
    await wrapper.findAll('button').find((button) => button.text().includes('新建分类'))!.trigger('click');
    const input = wrapper.find('input[aria-label="分类名称"]');
    await input.setValue('树');
    await wrapper.find('form').trigger('submit');
    await flushPromises();
    expect(mocked.post).toHaveBeenCalledWith('/categories', { name: '树' });
    expect(wrapper.find('input[aria-label="分类名称"]').exists()).toBe(false);
  });

  it('编辑分类时回填原名并调用 PATCH', async () => {
    const wrapper = await mountBoard();
    await wrapper.find('button[aria-label="编辑分类"]').trigger('click');
    expect((wrapper.find('input[aria-label="分类名称"]').element as HTMLInputElement).value).toBe('数组');
    await wrapper.find('input[aria-label="分类名称"]').setValue('数组进阶');
    await wrapper.find('form').trigger('submit');
    await flushPromises();
    expect(mocked.patch).toHaveBeenCalledWith('/categories/c1', { name: '数组进阶' });
  });

  it('删除分类需二次确认后才调用接口', async () => {
    const wrapper = await mountBoard();
    await wrapper.find('button[aria-label="删除分类"]').trigger('click');
    expect(wrapper.text()).toContain('确认删除「数组」吗');
    expect(mocked.delete).not.toHaveBeenCalled();
    await wrapper.findAll('button').find((button) => button.text() === '确认删除')!.trigger('click');
    await flushPromises();
    expect(mocked.delete).toHaveBeenCalledWith('/categories/c1');
  });
});
