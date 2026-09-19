import { defineStore } from 'pinia';
import { api } from '../api';
export const useTodoStore = defineStore('todo', { state: () => ({ items: [], pagination: { page: 1, pageSize: 10, total: 0, totalPages: 0 }, keyword: '', status: '', priority: '', overdue: false, loading: false, saving: false, deleting: false, listError: '', saveError: '', deleteError: '' }), actions: {
        message(error, fallback) { return error instanceof Error ? error.message : fallback; },
        async fetch() { this.loading = true; this.listError = ''; try {
            const response = await api.get('/todos', { params: { page: this.pagination.page, pageSize: this.pagination.pageSize, keyword: this.keyword || undefined, status: this.status || undefined, priority: this.priority || undefined, overdue: this.overdue || undefined } });
            this.items = response.data.data;
            this.pagination = response.data.pagination;
        }
        catch (error) {
            this.listError = this.message(error, '待办加载失败');
        }
        finally {
            this.loading = false;
        } },
        async search() { this.pagination.page = 1; await this.fetch(); },
        async setPage(page) { this.pagination.page = page; await this.fetch(); },
        async create(input) { this.saving = true; this.saveError = ''; try {
            const response = await api.post('/todos', input);
            await this.fetch();
            return response.data.data;
        }
        catch (error) {
            this.saveError = this.message(error, '待办保存失败');
            return null;
        }
        finally {
            this.saving = false;
        } },
        async get(id) { try {
            return (await api.get(`/todos/${id}`)).data.data;
        }
        catch (error) {
            this.saveError = this.message(error, '待办加载失败');
            return null;
        } },
        async update(id, input) { this.saving = true; this.saveError = ''; try {
            const response = await api.patch(`/todos/${id}`, input);
            await this.fetch();
            return response.data.data;
        }
        catch (error) {
            this.saveError = this.message(error, '待办保存失败');
            return null;
        }
        finally {
            this.saving = false;
        } },
        async toggle(todo) { return this.update(todo.id, { status: todo.status === 'COMPLETED' ? 'TODO' : 'COMPLETED' }); },
        async remove(id) { this.deleting = true; this.deleteError = ''; try {
            await api.delete(`/todos/${id}`);
            if (this.items.length === 1 && this.pagination.page > 1)
                this.pagination.page -= 1;
            await this.fetch();
            return true;
        }
        catch (error) {
            this.deleteError = this.message(error, '待办删除失败');
            return false;
        }
        finally {
            this.deleting = false;
        } }
    } });
