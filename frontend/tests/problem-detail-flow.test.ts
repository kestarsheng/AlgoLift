import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from '../src/api';
import { useProblemDetailStore } from '../src/stores/problemDetail';
import { usePracticeRecordStore } from '../src/stores/practiceRecord';

vi.mock('../src/api', () => ({ api: { get: vi.fn(), post: vi.fn(), delete: vi.fn() } }));
const pagination = { page: 1, pageSize: 10, total: 1, totalPages: 1 };
describe('problem detail flow stores', () => {
  beforeEach(() => { setActivePinia(createPinia()); vi.clearAllMocks(); });
  it('parses problem detail response', async () => { vi.mocked(api.get).mockResolvedValueOnce({ data: { data: { id: 'p1', title: 'Two Sum', difficulty: 'EASY', internalNote: '<p>x</p>', categories: [], notes: [] } } }); const store = useProblemDetailStore(); await store.fetch('p1'); expect(store.problem?.title).toBe('Two Sum'); expect(api.get).toHaveBeenCalledWith('/problems/p1'); });
  it('paginates, creates and deletes practice records', async () => { vi.mocked(api.get).mockResolvedValue({ data: { data: [{ id: 'r1', practicedAt: '2026-09-18', solvedFirstTry: true, remark: null }], pagination } }); vi.mocked(api.post).mockResolvedValue({ data: {} }); vi.mocked(api.delete).mockResolvedValue({ data: {} }); const store = usePracticeRecordStore(); await store.fetch('p1', 2); expect(api.get).toHaveBeenCalledWith('/problems/p1/practice-records', { params: { page: 2, pageSize: 10 } }); await store.create({ practicedAt: '2026-09-18', solvedFirstTry: true }); expect(api.post).toHaveBeenCalledWith('/problems/p1/practice-records', { practicedAt: '2026-09-18', solvedFirstTry: true }); await store.remove('r1'); expect(api.delete).toHaveBeenCalledWith('/problems/p1/practice-records/r1'); });
});
