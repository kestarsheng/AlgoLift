import { defineStore } from 'pinia';
import { api } from '../api';
import type { Category, Difficulty, Note } from '../types';

export interface ProblemDetail { id: string; title: string; difficulty: Difficulty; internalNote: string | null; categories: Category[]; notes: Note[] }
interface ProblemResponse { data: ProblemDetail }

export const useProblemDetailStore = defineStore('problemDetail', {
  state: () => ({ problem: null as ProblemDetail | null, loading: false, error: '' }),
  actions: { async fetch(problemId: string): Promise<void> { this.loading = true; this.error = ''; try { this.problem = (await api.get<ProblemResponse>(`/problems/${problemId}`)).data.data; } catch (error: unknown) { this.error = error instanceof Error ? error.message : '题目加载失败'; } finally { this.loading = false; } } },
});
