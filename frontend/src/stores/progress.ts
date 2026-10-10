import { defineStore } from 'pinia';
import { api } from '../api';
import type { Pagination, Progress } from '../types';
import { createPagedCrudStore, errorMessage, type PagedCrudState } from './factory';
interface ProgressResponse { data: Progress }
export interface ProgressInput { title: string; progress: number; progressDate: string; description?: string }
interface ProgressListState extends PagedCrudState<Progress> { listError: string; deleting: boolean; deleteError: string }
const base = createPagedCrudStore<Progress, ProgressListState>({ endpoint: '/progresses', errorMessages: { fetch: '进度加载失败', delete: '进度删除失败' }, listErrorField: 'listError', withDelete: true, guardConcurrency: true });
export const useProgressStore = defineStore('progress', {
  state: () => ({ items: [] as Progress[], pagination: { page: 1, pageSize: 9, total: 0, totalPages: 0 } as Pagination, keyword: '', loading: false, saving: false, deleting: false, listError: '', saveError: '', deleteError: '' }),
  actions: {
    ...base.actions,
    async create(input: ProgressInput): Promise<Progress | null> { if (this.saving) return null; this.saving = true; this.saveError = ''; try { const response = await api.post<ProgressResponse>('/progresses', input); await this.fetch(); return response.data.data; } catch (error: unknown) { this.saveError = errorMessage(error, '进度保存失败'); return null; } finally { this.saving = false; } },
    async get(id: string): Promise<Progress | null> { try { return (await api.get<ProgressResponse>(`/progresses/${id}`)).data.data; } catch (error: unknown) { this.saveError = errorMessage(error, '进度加载失败'); return null; } },
    async update(id: string, input: Partial<ProgressInput>): Promise<Progress | null> { if (this.saving) return null; this.saving = true; this.saveError = ''; try { const response = await api.patch<ProgressResponse>(`/progresses/${id}`, input); await this.fetch(); return response.data.data; } catch (error: unknown) { this.saveError = errorMessage(error, '进度保存失败'); return null; } finally { this.saving = false; } },
  },
});
