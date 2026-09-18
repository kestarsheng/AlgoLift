// Pinia store for one problem's practice history.
import { defineStore } from 'pinia';
import { api } from '../api';
import type { Pagination, PracticeRecord } from '../types';
interface RecordResponse { data: PracticeRecord[]; pagination: Pagination }
export const usePracticeRecordStore = defineStore('practiceRecord', { state: () => ({ problemId: '', items: [] as PracticeRecord[], pagination: { page: 1, pageSize: 10, total: 0, totalPages: 0 } as Pagination, loading: false, error: '' }), actions: { async fetch(problemId: string): Promise<void> { this.problemId = problemId; this.loading = true; this.error = ''; try { const response = await api.get<RecordResponse>(`/problems/${problemId}/practice-records`, { params: { page: this.pagination.page, pageSize: this.pagination.pageSize } }); this.items = response.data.data; this.pagination = response.data.pagination; } catch (error: unknown) { this.error = error instanceof Error ? error.message : '练习记录加载失败'; } finally { this.loading = false; } } } });
