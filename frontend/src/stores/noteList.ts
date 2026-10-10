// Pinia store for paginated solution-note lists, keyword search, and note creation.
import { defineStore } from 'pinia';
import { api } from '../api';
import type { Note, NoteListItem, Pagination } from '../types';
import { createPagedCrudStore, errorMessage } from './factory';
interface NoteDataResponse { data: Note }
const base = createPagedCrudStore<NoteListItem>({ endpoint: '/notes', errorMessages: { fetch: '题解笔记加载失败' } });
export const useNoteListStore = defineStore('noteList', {
  state: () => ({ items: [] as NoteListItem[], pagination: { page: 1, pageSize: 9, total: 0, totalPages: 0 } as Pagination, keyword: '', loading: false, error: '', saving: false, saveError: '' }),
  actions: {
    ...base.actions,
    async create(input: { title: string; content?: string }): Promise<Note | null> { this.saving = true; this.saveError = ''; try { const response = await api.post<NoteDataResponse>('/notes', { title: input.title.trim(), content: input.content ?? '', solutionLinks: [] }); await this.fetch(); return response.data.data; } catch (error: unknown) { this.saveError = errorMessage(error, '笔记保存失败'); return null; } finally { this.saving = false; } }
  },
});
