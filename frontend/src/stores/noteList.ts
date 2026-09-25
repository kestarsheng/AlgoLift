// Pinia store for paginated solution-note lists, keyword search, and note creation.
import { defineStore } from 'pinia';
import { api } from '../api';
import type { Note, NoteListItem, Pagination } from '../types';
interface NoteListResponse { data: NoteListItem[]; pagination: Pagination }
interface NoteDataResponse { data: Note }
export const useNoteListStore = defineStore('noteList', {
  state: () => ({ items: [] as NoteListItem[], pagination: { page: 1, pageSize: 9, total: 0, totalPages: 0 } as Pagination, keyword: '', loading: false, error: '', saving: false, saveError: '' }),
  actions: {
    async fetch(): Promise<void> { this.loading = true; this.error = ''; try { const response = await api.get<NoteListResponse>('/notes', { params: { page: this.pagination.page, pageSize: this.pagination.pageSize, keyword: this.keyword || undefined } }); this.items = response.data.data; this.pagination = response.data.pagination; } catch (error: unknown) { this.error = error instanceof Error ? error.message : '题解笔记加载失败'; } finally { this.loading = false; } },
    async search(): Promise<void> { this.pagination.page = 1; await this.fetch(); },
    async setPage(page: number): Promise<void> { this.pagination.page = page; await this.fetch(); },
    async create(input: { title: string; content?: string }): Promise<Note | null> { this.saving = true; this.saveError = ''; try { const response = await api.post<NoteDataResponse>('/notes', { title: input.title.trim(), content: input.content ?? '', solutionLinks: [] }); await this.fetch(); return response.data.data; } catch (error: unknown) { this.saveError = error instanceof Error ? error.message : '笔记保存失败'; return null; } finally { this.saving = false; } }
  },
});
