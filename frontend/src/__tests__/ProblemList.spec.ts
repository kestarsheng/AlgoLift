// 题目列表迁移测试：渲染、筛选、分页与跳转。
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createMemoryHistory } from 'vue-router';
import ProblemList from '../views/ProblemList.vue';
import { api } from '../api';
import type { ProblemListItem } from '../types';

vi.mock('../api', () => ({ api: { get: vi.fn(), post: vi.fn() } }));

const router = createRouter({ history: createMemoryHistory(), routes: [
  { path: '/categories/:categoryId/problems', name: 'problems', component: ProblemList },
  { path: '/problems/:problemId', name: 'problem-detail', component: { template: '<div />' } },
] });

const item = (id: string, title: string, extra: Partial<ProblemListItem> = {}): ProblemListItem => ({
  id, title, difficulty: 'EASY', practiceCount: 2, noteCount: 1, lastPracticedAt: null, ...extra,
});

const page = (data: ProblemListItem[], total: number, totalPages: number, pageNumber = 1) => ({
  data: { data, pagination: { page: pageNumber, pageSize: 10, total, totalPages } },
});

const mocked = api as unknown as { get: ReturnType<typeof vi.fn>; post: ReturnType<typeof vi.fn> };

const mountList = async () => {
  await router.push('/categories/c1/problems');
  await router.isReady();
  const wrapper = mount(ProblemList, { global: { plugins: [router] } });
  await flushPromises();
  return wrapper;
};

beforeEach(() => {
  setActivePinia(createPinia());
  mocked.get.mockReset().mockImplementation((url: string) => {
    if (url === '/categories') return Promise.resolve({ data: { data: [{ id: 'c1', name: '数组', problemCount: 25 }] } });
    return Promise.resolve(page([item('p1', 'Two Sum'), item('p2', '接雨水', { difficulty: 'HARD' })], 25, 3));
  });
  mocked.post.mockReset().mockResolvedValue({ data: { data: item('p9', '新题目') } });
  vi.stubGlobal('confirm', vi.fn(() => true));
});

describe('ProblemList', () => {
  it('渲染题目行与分类标题', async () => {
    const wrapper = await mountList();
    expect(wrapper.text()).toContain('数组 · 题目列表');
    expect(wrapper.find('[role="link"]').text()).toContain('Two Sum');
    expect(wrapper.text()).toContain('简单');
    expect(wrapper.text()).toContain('困难');
  });

  it('展示当前页区间与总题数', async () => {
    const wrapper = await mountList();
    expect(wrapper.text()).toContain('1–10');
    expect(wrapper.text()).toContain('25');
  });

  it('点击难度筛选后按该难度重新请求', async () => {
    const wrapper = await mountList();
    await wrapper.findAll('button').find((button) => button.text() === '困难')!.trigger('click');
    await flushPromises();
    const lastCall = mocked.get.mock.calls[mocked.get.mock.calls.length - 1];
    expect(lastCall[0]).toBe('/categories/c1/problems');
    expect(lastCall[1].params.difficulty).toBe('HARD');
    expect(lastCall[1].params.page).toBe(1);
  });

  it('提交搜索时带上关键词并回到第 1 页', async () => {
    const wrapper = await mountList();
    const searchForm = wrapper.findAll('form')[0];
    await wrapper.find('input[aria-label="搜索题目"]').setValue('two');
    await searchForm.trigger('submit');
    await flushPromises();
    const lastCall = mocked.get.mock.calls[mocked.get.mock.calls.length - 1];
    expect(lastCall[1].params.keyword).toBe('two');
    expect(lastCall[1].params.page).toBe(1);
  });

  it('点击下一页请求第 2 页', async () => {
    const wrapper = await mountList();
    await wrapper.find('button[aria-label="下一页"]').trigger('click');
    await flushPromises();
    expect(mocked.get.mock.calls[mocked.get.mock.calls.length - 1][1].params.page).toBe(2);
  });

  it('点击题目行跳转题目详情并携带来源分类', async () => {
    const wrapper = await mountList();
    const push = vi.spyOn(router, 'push');
    await wrapper.find('[role="link"]').trigger('click');
    expect(push).toHaveBeenCalledWith('/problems/p1?categoryId=c1');
  });

  it('关键词无结果时展示筛选空态', async () => {
    mocked.get.mockImplementation((url: string) => url === '/categories'
      ? Promise.resolve({ data: { data: [{ id: 'c1', name: '数组', problemCount: 0 }] } })
      : Promise.resolve(page([], 0, 0)));
    const wrapper = await mountList();
    expect(wrapper.text()).toContain('该分类下还没有题目');
  });

  it('加载失败时展示错误态', async () => {
    mocked.get.mockImplementation((url: string) => url === '/categories'
      ? Promise.resolve({ data: { data: [{ id: 'c1', name: '数组', problemCount: 0 }] } })
      : Promise.reject(new Error('服务不可用')));
    const wrapper = await mountList();
    expect(wrapper.text()).toContain('加载题目失败');
    expect(wrapper.text()).toContain('服务不可用');
  });

  it('新增题目成功后跳转详情', async () => {
    const wrapper = await mountList();
    await wrapper.findAll('button').find((button) => button.text().includes('新增题目'))!.trigger('click');
    await wrapper.find('input[aria-label="题目标题"]').setValue('新题目');
    const forms = wrapper.findAll('form');
    await forms[forms.length - 1].trigger('submit');
    await flushPromises();
    expect(mocked.post).toHaveBeenCalledWith('/problems', { title: '新题目', difficulty: 'EASY', categoryIds: ['c1'] });
  });
});
