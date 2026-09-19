import { defineStore } from 'pinia';
import { api } from '../api';
import type { Category, Difficulty, Note } from '../types';

export interface ProblemDetail { id: string; title: string; difficulty: Difficulty; internalNote: string | null; categories: Category[]; notes: Note[] }
interface ProblemResponse { data: ProblemDetail }

export const useProblemDetailStore = defineStore('problemDetail', {
  state: () => ({ problem: null as ProblemDetail | null, loading: false, saving: false, deleting: false, error: '', saveError: '', deleteError: '' }),
  actions: {
    async fetch(problemId: string): Promise<void> { this.loading = true; this.error = ''; try { this.problem = (await api.get<ProblemResponse>(`/problems/${problemId}`)).data.data; } catch (error: unknown) { this.error = error instanceof Error ? error.message : '题目加载失败'; } finally { this.loading = false; } },
    async update(problemId: string, payload: { title: string; difficulty: Difficulty; internalNote: string | null }): Promise<boolean> { this.saving = true; this.saveError = ''; try { await api.patch(`/problems/${problemId}`, payload); await this.fetch(problemId); return true; } catch (error: unknown) { this.saveError = error instanceof Error ? error.message : '题目保存失败'; return false; } finally { this.saving = false; } },
    async remove(problemId: string): Promise<boolean> { this.deleting = true; this.deleteError = ''; try { await api.delete(`/problems/${problemId}`); this.problem = null; return true; } catch (error: unknown) { this.deleteError = error instanceof Error ? error.message : '题目删除失败'; return false; } finally { this.deleting = false; } },
  },
});
