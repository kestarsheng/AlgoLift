// 题目详情迁移测试：渲染、编辑、管理分类、关联笔记与删除。
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createMemoryHistory } from 'vue-router';
import ProblemDetail from '../views/ProblemDetail.vue';
import { api } from '../api';
import type { ProblemDetail as Detail } from '../stores/problemDetail';

vi.mock('../api', () => ({ api: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), put: vi.fn(), delete: vi.fn() } }));

const router = createRouter({ history: createMemoryHistory(), routes: [
  { path: '/', name: 'home', component: { template: '<div />' } },
  { path: '/categories', name: 'categories', component: { template: '<div />' } },
  { path: '/categories/:categoryId/problems', name: 'problems', component: { template: '<div />' } },
  { path: '/problems/:problemId', name: 'problem-detail', component: ProblemDetail },
  { path: '/notes/:noteId', name: 'note-detail', component: { template: '<div />' } },
] });

const detail: Detail = {
  id: 'p1', title: 'Two Sum', difficulty: 'EASY', internalNote: '<p>哈希表思路</p>', createdAt: '2026-08-12T00:00:00.000Z',
  categories: [{ id: 'c1', name: '数组', problemCount: 12 }],
  notes: [{ id: 'n1', title: 'Two Sum 家族', content: '<p>从两数之和讲起</p>' }],
};

const mocked = api as unknown as Record<'get' | 'post' | 'patch' | 'put' | 'delete', ReturnType<typeof vi.fn>>;

const mountDetail = async (query = '?categoryId=c1') => {
  await router.push(`/problems/p1${query}`);
  await router.isReady();
  const wrapper = mount(ProblemDetail, { global: { plugins: [router] } });
  await flushPromises();
  return wrapper;
};

beforeEach(() => {
  setActivePinia(createPinia());
  mocked.get.mockReset().mockImplementation((url: string) => {
    if (url === '/problems/p1') return Promise.resolve({ data: { data: detail } });
    if (url === '/categories') return Promise.resolve({ data: { data: [{ id: 'c1', name: '数组', problemCount: 12 }, { id: 'c2', name: '哈希表', problemCount: 4 }] } });
    if (url === '/notes') return Promise.resolve({ data: { data: [{ id: 'n1', title: 'Two Sum 家族' }, { id: 'n2', title: '空间换时间' }] } });
    if (url === '/problems/p1/practice-records') return Promise.resolve({ data: { data: [{ id: 'r1', practicedAt: '2026-09-21T00:00:00.000Z', solvedFirstTry: true, remark: '一遍过' }], pagination: { page: 1, pageSize: 20, total: 5, totalPages: 1 } } });
    return Promise.resolve({ data: { data: [], pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 } } });
  });
  mocked.post.mockReset().mockResolvedValue({ data: { data: {} } });
  mocked.patch.mockReset().mockResolvedValue({ data: { data: detail } });
  mocked.put.mockReset().mockResolvedValue({ data: { data: detail } });
  mocked.delete.mockReset().mockResolvedValue({ data: {} });
  vi.stubGlobal('confirm', vi.fn(() => true));
});

describe('ProblemDetail', () => {
  it('渲染标题、难度标签、分类标签与创建时间', async () => {
    const wrapper = await mountDetail();
    expect(wrapper.find('h1').text()).toBe('Two Sum');
    expect(wrapper.text()).toContain('简单');
    expect(wrapper.text()).toContain('数组');
    expect(wrapper.text()).toContain('创建于 2026-08-12');
  });

  it('渲染内部笔记 HTML 与练习记录', async () => {
    const wrapper = await mountDetail();
    expect(wrapper.html()).toContain('哈希表思路');
    expect(wrapper.text()).toContain('一遍过');
    expect(wrapper.text()).toContain('5 次');
  });

  it('返回链接指向来源分类列表', async () => {
    const wrapper = await mountDetail();
    const backLink = wrapper.findAll('a').find((link) => link.text().includes('返回题目列表'))!;
    expect(backLink.attributes('href')).toBe('/categories/c1/problems');
  });

  it('缺少 categoryId 时返回链接指向分类看板', async () => {
    const wrapper = await mountDetail('');
    const backLink = wrapper.findAll('a').find((link) => link.text().includes('返回题目列表'))!;
    expect(backLink.attributes('href')).toBe('/categories');
  });

  it('编辑题目时回填当前值并调用 PATCH', async () => {
    const wrapper = await mountDetail();
    await wrapper.findAll('button').find((button) => button.text().includes('编辑题目'))!.trigger('click');
    const title = wrapper.find('input[aria-label="题目标题"]');
    expect((title.element as HTMLInputElement).value).toBe('Two Sum');
    await title.setValue('Two Sum II');
    const forms = wrapper.findAll('form');
    await forms[forms.length - 1].trigger('submit');
    await flushPromises();
    expect(mocked.patch).toHaveBeenCalledWith('/problems/p1', { title: 'Two Sum II', difficulty: 'EASY', internalNote: '<p>哈希表思路</p>' });
  });

  it('管理分类时默认勾选已关联分类并调用 PUT', async () => {
    const wrapper = await mountDetail();
    await wrapper.findAll('button').find((button) => button.text().includes('管理分类'))!.trigger('click');
    const boxes = wrapper.findAll('input[type="checkbox"]');
    expect((boxes[0].element as HTMLInputElement).checked).toBe(true);
    expect((boxes[1].element as HTMLInputElement).checked).toBe(false);
    await boxes[1].setValue(true);
    await wrapper.findAll('button').find((button) => button.text().includes('保存分类'))!.trigger('click');
    await flushPromises();
    expect(mocked.put).toHaveBeenCalledWith('/problems/p1/categories', { categoryIds: ['c1', 'c2'] });
  });

  it('关联笔记时调用 PUT 覆盖关联', async () => {
    const wrapper = await mountDetail();
    await wrapper.findAll('button').find((button) => button.text().includes('管理关联'))!.trigger('click');
    await wrapper.findAll('button').find((button) => button.text().includes('保存关联'))!.trigger('click');
    await flushPromises();
    expect(mocked.put).toHaveBeenCalledWith('/problems/p1/notes', { noteIds: ['n1'] });
  });

  it('新增练习记录调用接口', async () => {
    const wrapper = await mountDetail();
    await wrapper.findAll('button').find((button) => button.text().includes('记一次练习'))!.trigger('click');
    await wrapper.find('input[aria-label="练习备注"]').setValue('再练一次');
    await wrapper.find('form').trigger('submit');
    await flushPromises();
    expect(mocked.post).toHaveBeenCalledWith('/problems/p1/practice-records', expect.objectContaining({ solvedFirstTry: true, remark: '再练一次' }));
  });

  it('删除题目需二次确认并跳转回列表', async () => {
    const wrapper = await mountDetail();
    const push = vi.spyOn(router, 'push');
    await wrapper.findAll('button').find((button) => button.text().includes('删除题目'))!.trigger('click');
    expect(wrapper.text()).toContain('确认删除「Two Sum」吗');
    await wrapper.findAll('button').find((button) => button.text() === '确认删除')!.trigger('click');
    await flushPromises();
    expect(mocked.delete).toHaveBeenCalledWith('/problems/p1');
    expect(push).toHaveBeenCalledWith('/categories/c1/problems');
  });

  it('加载失败时展示错误态', async () => {
    mocked.get.mockImplementation((url: string) => url === '/problems/p1' ? Promise.reject(new Error('题目不存在')) : Promise.resolve({ data: { data: [], pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 } } }));
    const wrapper = await mountDetail();
    expect(wrapper.text()).toContain('加载题目失败');
    expect(wrapper.text()).toContain('题目不存在');
  });
});
