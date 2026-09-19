// Pinia store for filtered and paginated problem lists.
import { defineStore } from 'pinia';
import { api } from '../api';
export const useProblemListStore = defineStore('problemList', { state: () => ({ categoryId: '', items: [], pagination: { page: 1, pageSize: 10, total: 0, totalPages: 0 }, keyword: '', difficulty: '', loading: false, error: '' }), actions: { async fetch(categoryId) { this.categoryId = categoryId ?? this.categoryId; this.loading = true; this.error = ''; try {
            const path = this.categoryId ? `/categories/${this.categoryId}/problems` : '/problems';
            const response = await api.get(path, { params: { page: this.pagination.page, pageSize: this.pagination.pageSize, keyword: this.keyword || undefined, difficulty: this.difficulty || undefined } });
            this.items = response.data.data;
            this.pagination = response.data.pagination;
        }
        catch (error) {
            this.error = error instanceof Error ? error.message : '题目列表加载失败';
        }
        finally {
            this.loading = false;
        } }, async search() { this.pagination.page = 1; await this.fetch(); }, async setPage(page) { this.pagination.page = page; await this.fetch(); } } });
