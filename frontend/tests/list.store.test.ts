import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from '../src/api';
import { useNoteListStore } from '../src/stores/noteList';
import { useWrongListStore } from '../src/stores/wrongList';
vi.mock('../src/api', () => ({ api: { get: vi.fn() } }));
describe('list stores', () => {
  beforeEach(() => { setActivePinia(createPinia()); vi.clearAllMocks(); });
  it('requests wrong filters and pagination', async () => { vi.mocked(api.get).mockResolvedValueOnce({ data: { data: [], pagination: { page: 1, pageSize: 9, total: 0, totalPages: 0 } } }); const store = useWrongListStore(); store.keyword = '二分'; store.category = '数组'; store.difficulty = 'MEDIUM'; await store.search(); expect(api.get).toHaveBeenCalledWith('/wrongs', { params: { page: 1, pageSize: 9, keyword: '二分', category: '数组', difficulty: 'MEDIUM' } }); });
  it('requests note page and keyword', async () => { vi.mocked(api.get).mockResolvedValueOnce({ data: { data: [], pagination: { page: 2, pageSize: 9, total: 11, totalPages: 2 } } }); const store = useNoteListStore(); store.keyword = '贪心'; await store.setPage(2); expect(api.get).toHaveBeenCalledWith('/notes', { params: { page: 2, pageSize: 9, keyword: '贪心' } }); expect(store.pagination.totalPages).toBe(2); });
});
