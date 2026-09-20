// Pinia store for filtered and paginated problem lists.
import { defineStore } from 'pinia';
import { api } from '../api';
import type { Difficulty, Pagination, ProblemListItem } from '../types';
interface ProblemResponse { data: ProblemListItem[]; pagination: Pagination }
interface ProblemDataResponse { data: ProblemListItem }
interface CreateProblemPayload { title: string; difficulty: Difficulty; internalNote?: string; categoryIds?: string[] }
export const useProblemListStore = defineStore('problemList', { state: () => ({ categoryId: '', items: [] as ProblemListItem[], pagination: { page: 1, pageSize: 10, total: 0, totalPages: 0 } as Pagination, keyword: '', difficulty: '' as Difficulty | '', loading: false, error: '', saving: false, saveError: '' }), actions: {
  async fetch(categoryId?: string): Promise<void> { this.categoryId = categoryId ?? this.categoryId; this.loading = true; this.error = ''; try { const path = this.categoryId ? `/categories/${this.categoryId}/problems` : '/problems'; const response = await api.get<ProblemResponse>(path, { params: { page: this.pagination.page, pageSize: this.pagination.pageSize, keyword: this.keyword || undefined, difficulty: this.difficulty || undefined } }); this.items = response.data.data; this.pagination = response.data.pagination; } catch (error: unknown) { this.error = error instanceof Error ? error.message : '题目列表加载失败'; } finally { this.loading = false; } },
  async search(): Promise<void> { this.pagination.page = 1; await this.fetch(); },
  async setPage(page: number): Promise<void> { this.pagination.page = page; await this.fetch(); },
  async create(input: CreateProblemPayload): Promise<boolean> { this.saving = true; this.saveError = ''; const payload: CreateProblemPayload = { title: input.title.trim(), difficulty: input.difficulty, ...(input.internalNote?.trim() ? { internalNote: input.internalNote.trim() } : {}), ...(input.categoryIds?.length ? { categoryIds: input.categoryIds } : {}) }; try { await api.post<ProblemDataResponse>('/problems', payload); await this.fetch(); return true; } catch (error: unknown) { this.saveError = error instanceof Error ? error.message : '题目保存失败'; return false; } finally { this.saving = false; } }
} });
