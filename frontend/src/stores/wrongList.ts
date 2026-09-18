// Pinia store for paginated wrong-problem lists and filters.
import { defineStore } from 'pinia';
import { api } from '../api';
import type { Difficulty, Pagination, WrongListItem } from '../types';
interface WrongListResponse { data: WrongListItem[]; pagination: Pagination }
export const useWrongListStore = defineStore('wrongList', {
  state: () => ({ items: [] as WrongListItem[], pagination: { page: 1, pageSize: 10, total: 0, totalPages: 0 } as Pagination, keyword: '', category: '', difficulty: '' as Difficulty | '', loading: false, error: '' }),
  actions: {
    async fetch(): Promise<void> { this.loading = true; this.error = ''; try { const response = await api.get<WrongListResponse>('/wrongs', { params: { page: this.pagination.page, pageSize: this.pagination.pageSize, keyword: this.keyword || undefined, category: this.category || undefined, difficulty: this.difficulty || undefined } }); this.items = response.data.data; this.pagination = response.data.pagination; } catch (error: unknown) { this.error = error instanceof Error ? error.message : '错题列表加载失败'; } finally { this.loading = false; } },
    async search(): Promise<void> { this.pagination.page = 1; await this.fetch(); },
    async setPage(page: number): Promise<void> { this.pagination.page = page; await this.fetch(); },
  },
});
