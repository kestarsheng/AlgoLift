// Pinia store for the problem detail page (metadata, categories, linked notes).
import { defineStore } from 'pinia';
import { api } from '../api';
import type { Category, Difficulty, Note } from '../types';

export interface ProblemDetail { id: string; title: string; difficulty: Difficulty; internalNote: string | null; createdAt?: string; categories: Category[]; notes: Note[] }
interface ProblemResponse { data: ProblemDetail }
interface ProblemNotesResponse { data: { problemId: string; notes: Note[] } }

export const useProblemDetailStore = defineStore('problemDetail', {
  state: () => ({ problem: null as ProblemDetail | null, loading: false, saving: false, deleting: false, error: '', saveError: '', deleteError: '' }),
  actions: {
    /** 拉取题目详情（含关联分类与笔记）。 */
    async fetch(problemId: string): Promise<void> { this.loading = true; this.error = ''; try { this.problem = (await api.get<ProblemResponse>(`/problems/${problemId}`)).data.data; } catch (error: unknown) { this.error = error instanceof Error ? error.message : '题目加载失败'; } finally { this.loading = false; } },
    /** 编辑题目标题/难度/内部笔记；成功后重新拉取详情，失败写入 saveError。 */
    async update(problemId: string, payload: { title: string; difficulty: Difficulty; internalNote: string | null }): Promise<boolean> { this.saving = true; this.saveError = ''; try { await api.patch(`/problems/${problemId}`, payload); await this.fetch(problemId); return true; } catch (error: unknown) { this.saveError = error instanceof Error ? error.message : '题目保存失败'; return false; } finally { this.saving = false; } },
    /** 整体替换题目关联分类；成功后刷新详情。 */
    async saveCategories(problemId: string, categoryIds: string[]): Promise<boolean> { this.saving = true; this.saveError = ''; try { await api.put(`/problems/${problemId}/categories`, { categoryIds }); await this.fetch(problemId); return true; } catch (error: unknown) { this.saveError = error instanceof Error ? error.message : '分类保存失败'; return false; } finally { this.saving = false; } },
    /** 整体替换题目关联题解笔记；接口直接返回新关联，无需二次拉取详情。 */
    async saveNotes(problemId: string, noteIds: string[]): Promise<boolean> { this.saving = true; this.saveError = ''; try { const response = await api.put<ProblemNotesResponse>(`/problems/${problemId}/notes`, { noteIds }); if (this.problem) this.problem.notes = response.data.data?.notes ?? []; return true; } catch (error: unknown) { this.saveError = error instanceof Error ? error.message : '笔记关联保存失败'; return false; } finally { this.saving = false; } },
    /** 删除题目；成功后清空详情，失败写入 deleteError。 */
    async remove(problemId: string): Promise<boolean> { this.deleting = true; this.deleteError = ''; try { await api.delete(`/problems/${problemId}`); this.problem = null; return true; } catch (error: unknown) { this.deleteError = error instanceof Error ? error.message : '题目删除失败'; return false; } finally { this.deleting = false; } },
  },
});
