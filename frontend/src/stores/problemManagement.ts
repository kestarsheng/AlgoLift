// Pinia store for replacing problem category and note associations.
import { defineStore } from 'pinia';
import { api } from '../api';
import type { Category, Note } from '../types';
interface CategoryResponse { data: Category[] }
export const useProblemManagementStore = defineStore('problemManagement', {
  state: () => ({ categories: [] as Category[], notes: [] as Note[], loading: false, savingCategories: false, savingNotes: false, categoryError: '', noteError: '' }),
  actions: {
    async fetchCategories(): Promise<void> { this.loading = true; this.categoryError = ''; try { this.categories = (await api.get<CategoryResponse>('/categories', { params: { includeEmpty: true } })).data.data; } catch (error: unknown) { this.categoryError = error instanceof Error ? error.message : '分类加载失败'; } finally { this.loading = false; } },
    async saveCategories(problemId: string, categoryIds: string[]): Promise<boolean> { this.savingCategories = true; this.categoryError = ''; try { await api.put(`/problems/${problemId}/categories`, { categoryIds }); return true; } catch (error: unknown) { this.categoryError = error instanceof Error ? error.message : '分类保存失败'; return false; } finally { this.savingCategories = false; } },
    async fetchNotes(): Promise<void> { this.loading = true; this.noteError = ''; try { this.notes = (await api.get<{ data: Note[] }>('/notes', { params: { page: 1, pageSize: 100 } })).data.data; } catch (error: unknown) { this.noteError = error instanceof Error ? error.message : '笔记加载失败'; } finally { this.loading = false; } },
    async saveNotes(problemId: string, noteIds: string[]): Promise<boolean> { this.savingNotes = true; this.noteError = ''; try { await api.put(`/problems/${problemId}/notes`, { noteIds }); return true; } catch (error: unknown) { this.noteError = error instanceof Error ? error.message : '笔记关联保存失败'; return false; } finally { this.savingNotes = false; } },
  },
});
