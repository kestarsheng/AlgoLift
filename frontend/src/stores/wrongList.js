// Pinia store for paginated wrong-problem lists and filters.
import { defineStore } from 'pinia';
import { api } from '../api';
export const useWrongListStore = defineStore('wrongList', {
    state: () => ({ items: [], pagination: { page: 1, pageSize: 10, total: 0, totalPages: 0 }, keyword: '', category: '', difficulty: '', loading: false, error: '' }),
    actions: {
        async fetch() { this.loading = true; this.error = ''; try {
            const response = await api.get('/wrongs', { params: { page: this.pagination.page, pageSize: this.pagination.pageSize, keyword: this.keyword || undefined, category: this.category || undefined, difficulty: this.difficulty || undefined } });
            this.items = response.data.data;
            this.pagination = response.data.pagination;
        }
        catch (error) {
            this.error = error instanceof Error ? error.message : '错题列表加载失败';
        }
        finally {
            this.loading = false;
        } },
        async search() { this.pagination.page = 1; await this.fetch(); },
        async setPage(page) { this.pagination.page = page; await this.fetch(); },
    },
});
