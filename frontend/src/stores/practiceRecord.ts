// Pinia store for one problem's practice history.
import { defineStore } from 'pinia';
import { api } from '../api';
import type { Pagination, PracticeRecord } from '../types';
interface RecordResponse { data: PracticeRecord[]; pagination: Pagination }
interface RecordInput { practicedAt: string; solvedFirstTry: boolean; remark?: string }
interface RecordUpdate { practicedAt?: string; solvedFirstTry?: boolean; remark?: string | null }
export const usePracticeRecordStore = defineStore('practiceRecord', {
  state: () => ({
    problemId: '',
    items: [] as PracticeRecord[],
    pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 } as Pagination,
    loading: false,
    saving: false,
    error: '',
  }),
  getters: {
    /** 练习总条数；列表接口返回的 total 优先，缺失时回退为当前页条数。 */
    total: (state): number => state.pagination.total || state.items.length,
  },
  actions: {
    /** 拉取练习记录分页；page 缺省时沿用当前页。 */
    async fetch(problemId: string, page?: number): Promise<void> {
      this.problemId = problemId;
      this.pagination.page = page ?? this.pagination.page;
      this.loading = true;
      this.error = '';
      try {
        const response = await api.get<RecordResponse>(`/problems/${problemId}/practice-records`, { params: { page: this.pagination.page, pageSize: this.pagination.pageSize } });
        this.items = response.data.data ?? [];
        this.pagination = response.data.pagination ?? { page: this.pagination.page, pageSize: this.pagination.pageSize, total: 0, totalPages: 0 };
      } catch (error: unknown) {
        this.error = error instanceof Error ? error.message : '练习记录加载失败';
      } finally {
        this.loading = false;
      }
    },
    /** 新增练习记录；成功后回到第 1 页刷新列表，失败抛出以便调用方保留表单。 */
    async create(input: RecordInput): Promise<void> {
      this.saving = true;
      this.error = '';
      try {
        await api.post(`/problems/${this.problemId}/practice-records`, input);
        await this.fetch(this.problemId, 1);
      } catch (error: unknown) {
        this.error = error instanceof Error ? error.message : '练习记录保存失败';
        throw error;
      } finally {
        this.saving = false;
      }
    },
    /** 删除练习记录；删空当页时自动回退到上一页。 */
    async remove(recordId: string): Promise<void> {
      this.error = '';
      try {
        await api.delete(`/problems/${this.problemId}/practice-records/${recordId}`);
        const page = this.items.length === 1 && this.pagination.page > 1 ? this.pagination.page - 1 : this.pagination.page;
        await this.fetch(this.problemId, page);
      } catch (error: unknown) {
        this.error = error instanceof Error ? error.message : '练习记录删除失败';
      }
    },
    /** 修改练习记录；成功后刷新当前页。 */
    async update(recordId: string, input: RecordUpdate): Promise<void> {
      this.saving = true;
      this.error = '';
      try {
        await api.patch(`/problems/${this.problemId}/practice-records/${recordId}`, input);
        await this.fetch(this.problemId, this.pagination.page);
      } catch (error: unknown) {
        this.error = error instanceof Error ? error.message : '练习记录更新失败';
        throw error;
      } finally {
        this.saving = false;
      }
    },
  },
});
