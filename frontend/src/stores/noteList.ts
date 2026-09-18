// Pinia store for paginated solution-note lists and keyword search.
import { defineStore } from 'pinia';
import { api } from '../api';
import type { NoteListItem, Pagination } from '../types';
interface NoteListResponse { data: NoteListItem[]; pagination: Pagination }
export const useNoteListStore = defineStore('noteList', {
  state: () => ({ items: [] as NoteListItem[], pagination: { page: 1, pageSize: 10, total: 0, totalPages: 0 } as Pagination, keyword: '', loading: false, error: '' }),
  actions: {
    async fetch(): Promise<void> { this.loading = true; this.error = ''; try { const response = await api.get<NoteListResponse>('/notes', { params: { page: this.pagination.page, pageSize: this.pagination.pageSize, keyword: this.keyword || undefined } }); this.items = response.data.data; this.pagination = response.data.pagination; } catch (error: unknown) { this.error = error instanceof Error ? error.message : '题解笔记加载失败'; } finally { this.loading = false; } },
    async search(): Promise<void> { this.pagination.page = 1; await this.fetch(); },
    async setPage(page: number): Promise<void> { this.pagination.page = page; await this.fetch(); },
  },
});
