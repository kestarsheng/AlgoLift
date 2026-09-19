import { defineStore } from 'pinia';
import { api } from '../api';
import type { Pagination, Progress } from '../types';
interface ProgressPage { data: Progress[]; pagination: Pagination }
interface ProgressResponse { data: Progress }
export interface ProgressInput { title: string; progress: number; progressDate: string; description?: string }
export const useProgressStore = defineStore('progress', {
  state: () => ({ items: [] as Progress[], pagination: { page: 1, pageSize: 10, total: 0, totalPages: 0 } as Pagination, keyword: '', loading: false, saving: false, deleting: false, listError: '', saveError: '', deleteError: '' }),
  actions: {
    message(error: unknown, fallback: string): string { return error instanceof Error ? error.message : fallback; },
    async fetch(): Promise<void> { this.loading = true; this.listError = ''; try { const response = await api.get<ProgressPage>('/progresses', { params: { page: this.pagination.page, pageSize: this.pagination.pageSize, keyword: this.keyword || undefined } }); this.items = response.data.data; this.pagination = response.data.pagination; } catch (error: unknown) { this.listError = this.message(error, '进度加载失败'); } finally { this.loading = false; } },
    async search(): Promise<void> { this.pagination.page = 1; await this.fetch(); },
    async setPage(page: number): Promise<void> { this.pagination.page = page; await this.fetch(); },
    async create(input: ProgressInput): Promise<Progress | null> { if (this.saving) return null; this.saving = true; this.saveError = ''; try { const response = await api.post<ProgressResponse>('/progresses', input); await this.fetch(); return response.data.data; } catch (error: unknown) { this.saveError = this.message(error, '进度保存失败'); return null; } finally { this.saving = false; } },
    async get(id: string): Promise<Progress | null> { try { return (await api.get<ProgressResponse>(`/progresses/${id}`)).data.data; } catch (error: unknown) { this.saveError = this.message(error, '进度加载失败'); return null; } },
    async update(id: string, input: Partial<ProgressInput>): Promise<Progress | null> { if (this.saving) return null; this.saving = true; this.saveError = ''; try { const response = await api.patch<ProgressResponse>(`/progresses/${id}`, input); await this.fetch(); return response.data.data; } catch (error: unknown) { this.saveError = this.message(error, '进度保存失败'); return null; } finally { this.saving = false; } },
    async remove(id: string): Promise<boolean> { if (this.deleting) return false; this.deleting = true; this.deleteError = ''; try { await api.delete(`/progresses/${id}`); if (this.items.length === 1 && this.pagination.page > 1) this.pagination.page -= 1; await this.fetch(); return true; } catch (error: unknown) { this.deleteError = this.message(error, '进度删除失败'); return false; } finally { this.deleting = false; } }
  }
});
