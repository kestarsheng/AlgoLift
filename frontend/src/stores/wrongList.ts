// Pinia store for paginated wrong-problem lists, filters, and wrong CRUD.
import { defineStore } from 'pinia';
import { api } from '../api';
import type { Difficulty, Pagination, SolutionLink, Wrong, WrongListItem } from '../types';
import { createPagedCrudStore, errorMessage, type PagedCrudState } from './factory';
interface WrongDataResponse { data: Wrong }
export interface WrongInputPayload { title: string; difficulty: Difficulty; category?: string; review?: string; solutionLinks?: SolutionLink[] }
interface WrongListState extends PagedCrudState<WrongListItem> { error: string; deleting: boolean; deleteError: string; category: string; difficulty: Difficulty | '' }
const base = createPagedCrudStore<WrongListItem, WrongListState>({
  endpoint: '/wrongs',
  errorMessages: { fetch: '错题列表加载失败', delete: '错题删除失败' },
  withDelete: true,
  buildParams: (state) => ({ page: state.pagination.page, pageSize: state.pagination.pageSize, keyword: state.keyword || undefined, category: state.category || undefined, difficulty: state.difficulty || undefined }),
});
export const useWrongListStore = defineStore('wrongList', {
  state: () => ({ items: [] as WrongListItem[], pagination: { page: 1, pageSize: 9, total: 0, totalPages: 0 } as Pagination, keyword: '', category: '', difficulty: '' as Difficulty | '', loading: false, error: '', saving: false, deleting: false, saveError: '', deleteError: '' }),
  actions: {
    ...base.actions,
    async get(id: string): Promise<Wrong | null> { try { return (await api.get<WrongDataResponse>(`/wrongs/${id}`)).data.data; } catch (error: unknown) { this.saveError = errorMessage(error, '错题加载失败'); return null; } },
    async create(input: WrongInputPayload): Promise<Wrong | null> { this.saving = true; this.saveError = ''; const payload: WrongInputPayload = { title: input.title.trim(), difficulty: input.difficulty, ...(input.category?.trim() ? { category: input.category.trim() } : {}), ...(input.review?.trim() ? { review: input.review.trim() } : {}), solutionLinks: input.solutionLinks ?? [] }; try { const response = await api.post<WrongDataResponse>('/wrongs', payload); await this.fetch(); return response.data.data; } catch (error: unknown) { this.saveError = errorMessage(error, '错题保存失败'); return null; } finally { this.saving = false; } },
    async update(id: string, input: Partial<WrongInputPayload>): Promise<Wrong | null> { this.saving = true; this.saveError = ''; try { return (await api.patch<WrongDataResponse>(`/wrongs/${id}`, input)).data.data; } catch (error: unknown) { this.saveError = errorMessage(error, '错题保存失败'); return null; } finally { this.saving = false; } },
  },
});
