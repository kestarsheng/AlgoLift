// Pinia store for one problem's practice history.
import { defineStore } from 'pinia';
import { api } from '../api';
export const usePracticeRecordStore = defineStore('practiceRecord', { state: () => ({ problemId: '', items: [], pagination: { page: 1, pageSize: 10, total: 0, totalPages: 0 }, loading: false, saving: false, error: '' }), actions: { async fetch(problemId, page) { this.problemId = problemId; this.pagination.page = page ?? this.pagination.page; this.loading = true; this.error = ''; try {
            const response = await api.get(`/problems/${problemId}/practice-records`, { params: { page: this.pagination.page, pageSize: this.pagination.pageSize } });
            this.items = response.data.data;
            this.pagination = response.data.pagination;
        }
        catch (error) {
            this.error = error instanceof Error ? error.message : '练习记录加载失败';
        }
        finally {
            this.loading = false;
        } }, async create(input) { this.saving = true; this.error = ''; try {
            await api.post(`/problems/${this.problemId}/practice-records`, input);
            await this.fetch(this.problemId, 1);
        }
        catch (error) {
            this.error = error instanceof Error ? error.message : '练习记录保存失败';
            throw error;
        }
        finally {
            this.saving = false;
        } }, async remove(recordId) { this.error = ''; try {
            await api.delete(`/problems/${this.problemId}/practice-records/${recordId}`);
            const page = this.items.length === 1 && this.pagination.page > 1 ? this.pagination.page - 1 : this.pagination.page;
            await this.fetch(this.problemId, page);
        }
        catch (error) {
            this.error = error instanceof Error ? error.message : '练习记录删除失败';
        } } } });
