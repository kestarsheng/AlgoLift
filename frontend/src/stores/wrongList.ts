// Pinia store for paginated wrong-problem lists, filters, and wrong CRUD.
import { defineStore } from 'pinia';
import { api } from '../api';
import type { Difficulty, Pagination, Wrong, WrongListItem } from '../types';
interface WrongListResponse { data: WrongListItem[]; pagination: Pagination }
interface WrongDataResponse { data: Wrong }
export interface WrongInputPayload { title: string; difficulty: Difficulty; category?: string; review?: string; solutionLinks?: { name: string; url: string }[] }
export const useWrongListStore = defineStore('wrongList', {
  state: () => ({ items: [] as WrongListItem[], pagination: { page: 1, pageSize: 9, total: 0, totalPages: 0 } as Pagination, keyword: '', category: '', difficulty: '' as Difficulty | '', loading: false, error: '', saving: false, deleting: false, saveError: '', deleteError: '' }),
  actions: {
    message(error: unknown, fallback: string): string { return error instanceof Error ? error.message : fallback; },
    async fetch(): Promise<void> { this.loading = true; this.error = ''; try { const response = await api.get<WrongListResponse>('/wrongs', { params: { page: this.pagination.page, pageSize: this.pagination.pageSize, keyword: this.keyword || undefined, category: this.category || undefined, difficulty: this.difficulty || undefined } }); this.items = response.data.data; this.pagination = response.data.pagination; } catch (error: unknown) { this.error = this.message(error, '错题列表加载失败'); } finally { this.loading = false; } },
    async search(): Promise<void> { this.pagination.page = 1; await this.fetch(); },
    async setPage(page: number): Promise<void> { this.pagination.page = page; await this.fetch(); },
    async get(id: string): Promise<Wrong | null> { try { return (await api.get<WrongDataResponse>(`/wrongs/${id}`)).data.data; } catch (error: unknown) { this.saveError = this.message(error, '错题加载失败'); return null; } },
    async create(input: WrongInputPayload): Promise<Wrong | null> { this.saving = true; this.saveError = ''; const payload: WrongInputPayload = { title: input.title.trim(), difficulty: input.difficulty, ...(input.category?.trim() ? { category: input.category.trim() } : {}), ...(input.review?.trim() ? { review: input.review.trim() } : {}), solutionLinks: input.solutionLinks ?? [] }; try { const response = await api.post<WrongDataResponse>('/wrongs', payload); await this.fetch(); return response.data.data; } catch (error: unknown) { this.saveError = this.message(error, '错题保存失败'); return null; } finally { this.saving = false; } },
    async update(id: string, input: Partial<WrongInputPayload>): Promise<Wrong | null> { this.saving = true; this.saveError = ''; try { return (await api.patch<WrongDataResponse>(`/wrongs/${id}`, input)).data.data; } catch (error: unknown) { this.saveError = this.message(error, '错题保存失败'); return null; } finally { this.saving = false; } },
    async remove(id: string): Promise<boolean> { this.deleting = true; this.deleteError = ''; try { await api.delete(`/wrongs/${id}`); if (this.items.length === 1 && this.pagination.page > 1) this.pagination.page -= 1; await this.fetch(); return true; } catch (error: unknown) { this.deleteError = this.message(error, '错题删除失败'); return false; } finally { this.deleting = false; } }
  },
});
