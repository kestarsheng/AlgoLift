import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from '../src/api';
import { useDashboardStore } from '../src/stores/dashboard';

vi.mock('../src/api', () => ({ api: { get: vi.fn() } }));
const page = { data: [], pagination: { page: 1, pageSize: 10, total: 0, totalPages: 0 } };

describe('dashboard store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    vi.mocked(api.get).mockResolvedValue({ data: page });
  });

  it('loads modules in parallel and aggregates counts', async () => {
    vi.mocked(api.get).mockImplementation((path) => Promise.resolve({ data: path === '/categories' ? { data: [{ id: 'c1', name: '数组', problemCount: 2 }] } : path === '/progresses' ? { data: [{ id: 'p1', title: '二分', progress: 60 }], pagination: page.pagination } : { data: [], pagination: { ...page.pagination, total: 3 } } }));
    const store = useDashboardStore();
    await store.fetch();
    expect(api.get).toHaveBeenCalledTimes(8);
    expect(store.categories.data).toHaveLength(1);
    expect(store.problems.data.pagination.total).toBe(3);
    expect(store.loading).toBe(false);
  });

  it('keeps other modules when one request fails', async () => {
    vi.mocked(api.get).mockImplementation((path) => path === '/wrongs' ? Promise.reject(new Error('错题服务不可用')) : Promise.resolve({ data: path === '/categories' ? { data: [] } : page }));
    const store = useDashboardStore();
    await store.fetch();
    expect(store.wrongs.error).toContain('错题服务不可用');
    expect(store.notes.error).toBe('');
    expect(store.hasErrors).toBe(true);
  });

  it('derives totals, accuracy, and today count from backend stats fields', () => {
    const store = useDashboardStore();
    store.stats.data = { difficultyCounts: { EASY: 5, MEDIUM: 3, HARD: 2 }, dailyPractice: [{ date: new Date().toISOString().slice(0, 10), count: 4 }], totalProblems: 10, completedProblems: 7, accuracy: 85 };
    expect(store.totalProblems).toBe(10);
    expect(store.completedProblems).toBe(7);
    expect(store.todayCount).toBe(4);
    expect(store.accuracy).toBe(85);
  });

  it('derives category mastery from progress titles', async () => {
    vi.mocked(api.get).mockImplementation((path) => Promise.resolve({ data: path === '/categories' ? { data: [{ id: 'c1', name: '数组', problemCount: 2 }, { id: 'c2', name: '图', problemCount: 1 }] } : path === '/progresses' ? { data: [{ id: 'p1', title: '数组', progress: 80 }, { id: 'p2', title: '图', progress: 45 }], pagination: page.pagination } : page }));
    const store = useDashboardStore();
    await store.fetch();
    expect(store.categoryMastery).toEqual([{ id: 'c1', name: '数组', percent: 80 }, { id: 'c2', name: '图', percent: 45 }]);
  });

  it('derives recently mastered knowledge from progress records', async () => {
    vi.mocked(api.get).mockImplementation((path) => Promise.resolve({ data: path === '/progresses' ? { data: [{ id: 'p1', title: '拓扑排序', progress: 92, description: 'BFS + 入度' }, { id: 'p2', title: '滑动窗口', progress: 85, description: null }], pagination: page.pagination } : page }));
    const store = useDashboardStore();
    await store.fetch();
    expect(store.recentMastered).toHaveLength(2);
    expect(store.recentMastered[0]).toMatchObject({ id: 'p1', title: '拓扑排序', percent: 92, description: 'BFS + 入度' });
  });
});