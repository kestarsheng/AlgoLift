// Pinia store for filtered and paginated problem lists.
import { defineStore } from 'pinia';
import { api } from '../api';
import type { Category, Difficulty, Pagination, ProblemListItem } from '../types';
interface ProblemResponse { data: ProblemListItem[]; pagination: Pagination }
interface ProblemDataResponse { data: ProblemListItem }
interface CategoryResponse { data: Category[] }
interface CreateProblemPayload { title: string; difficulty: Difficulty; internalNote?: string; categoryIds?: string[] }
export const useProblemListStore = defineStore('problemList', { state: () => ({ categoryId: '', categoryName: '', items: [] as ProblemListItem[], pagination: { page: 1, pageSize: 10, total: 0, totalPages: 0 } as Pagination, keyword: '', difficulty: '' as Difficulty | '', loading: false, error: '', saving: false, saveError: '' }), getters: {
  /** 当前页已练习题数（有练习记录即视为练习过）。 */
  practicedCount: (state): number => state.items.filter((item) => item.practiceCount > 0).length,
}, actions: {
  /** 拉取分类下的题目分页；分类名缺失时顺带补齐标题所需信息。 */
  async fetch(categoryId?: string): Promise<void> { this.categoryId = categoryId ?? this.categoryId; this.loading = true; this.error = ''; try { const path = this.categoryId ? `/categories/${this.categoryId}/problems` : '/problems'; const response = await api.get<ProblemResponse>(path, { params: { page: this.pagination.page, pageSize: this.pagination.pageSize, keyword: this.keyword || undefined, difficulty: this.difficulty || undefined } }); this.items = response.data.data; this.pagination = response.data.pagination; } catch (error: unknown) { this.error = error instanceof Error ? error.message : '题目列表加载失败'; } finally { this.loading = false; } },
  /** 读取当前分类名称用于页面标题，失败时静默降级为「题目列表」。 */
  async fetchCategoryName(): Promise<void> { if (!this.categoryId) return; try { const response = await api.get<CategoryResponse>('/categories', { params: { includeEmpty: true } }); this.categoryName = response.data.data.find((item) => item.id === this.categoryId)?.name ?? ''; } catch { this.categoryName = ''; } },
  /** 筛选条件变化后回到第 1 页再请求。 */
  async search(): Promise<void> { this.pagination.page = 1; await this.fetch(); },
  /** 切换难度筛选并立即查询（空串表示全部）。 */
  async setDifficulty(difficulty: Difficulty | ''): Promise<void> { this.difficulty = difficulty; await this.search(); },
  async setPage(page: number): Promise<void> { this.pagination.page = page; await this.fetch(); },
  /** 新建题目；成功后刷新当前页，返回新题以便调用方跳转详情。 */
  async create(input: CreateProblemPayload): Promise<ProblemListItem | null> { this.saving = true; this.saveError = ''; const payload: CreateProblemPayload = { title: input.title.trim(), difficulty: input.difficulty, ...(input.internalNote?.trim() ? { internalNote: input.internalNote.trim() } : {}), ...(input.categoryIds?.length ? { categoryIds: input.categoryIds } : {}) }; try { const response = await api.post<ProblemDataResponse>('/problems', payload); await this.fetch(); return response.data.data; } catch (error: unknown) { this.saveError = error instanceof Error ? error.message : '题目保存失败'; return null; } finally { this.saving = false; } }
} });
