// Pinia store for paginated solution-note lists and keyword search.
import { defineStore } from 'pinia';
import { api } from '../api';
export const useNoteListStore = defineStore('noteList', {
    state: () => ({ items: [], pagination: { page: 1, pageSize: 10, total: 0, totalPages: 0 }, keyword: '', loading: false, error: '' }),
    actions: {
        async fetch() { this.loading = true; this.error = ''; try {
            const response = await api.get('/notes', { params: { page: this.pagination.page, pageSize: this.pagination.pageSize, keyword: this.keyword || undefined } });
            this.items = response.data.data;
            this.pagination = response.data.pagination;
        }
        catch (error) {
            this.error = error instanceof Error ? error.message : '题解笔记加载失败';
        }
        finally {
            this.loading = false;
        } },
        async search() { this.pagination.page = 1; await this.fetch(); },
        async setPage(page) { this.pagination.page = page; await this.fetch(); },
    },
});
