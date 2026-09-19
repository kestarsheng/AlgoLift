// Pinia store for replacing problem category and note associations.
import { defineStore } from 'pinia';
import { api } from '../api';
export const useProblemManagementStore = defineStore('problemManagement', {
    state: () => ({ categories: [], notes: [], loading: false, savingCategories: false, savingNotes: false, categoryError: '', noteError: '' }),
    actions: {
        async fetchCategories() { this.loading = true; this.categoryError = ''; try {
            this.categories = (await api.get('/categories', { params: { includeEmpty: true } })).data.data;
        }
        catch (error) {
            this.categoryError = error instanceof Error ? error.message : '分类加载失败';
        }
        finally {
            this.loading = false;
        } },
        async saveCategories(problemId, categoryIds) { this.savingCategories = true; this.categoryError = ''; try {
            await api.put(`/problems/${problemId}/categories`, { categoryIds });
            return true;
        }
        catch (error) {
            this.categoryError = error instanceof Error ? error.message : '分类保存失败';
            return false;
        }
        finally {
            this.savingCategories = false;
        } },
        async fetchNotes() { this.loading = true; this.noteError = ''; try {
            this.notes = (await api.get('/notes', { params: { page: 1, pageSize: 100 } })).data.data;
        }
        catch (error) {
            this.noteError = error instanceof Error ? error.message : '笔记加载失败';
        }
        finally {
            this.loading = false;
        } },
        async saveNotes(problemId, noteIds) { this.savingNotes = true; this.noteError = ''; try {
            await api.put(`/problems/${problemId}/notes`, { noteIds });
            return true;
        }
        catch (error) {
            this.noteError = error instanceof Error ? error.message : '笔记关联保存失败';
            return false;
        }
        finally {
            this.savingNotes = false;
        } },
    },
});
