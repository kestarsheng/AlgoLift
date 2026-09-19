import { defineStore } from 'pinia';
import { api } from '../api';
export const useProblemDetailStore = defineStore('problemDetail', {
    state: () => ({ problem: null, loading: false, saving: false, deleting: false, error: '', saveError: '', deleteError: '' }),
    actions: {
        async fetch(problemId) { this.loading = true; this.error = ''; try {
            this.problem = (await api.get(`/problems/${problemId}`)).data.data;
        }
        catch (error) {
            this.error = error instanceof Error ? error.message : '题目加载失败';
        }
        finally {
            this.loading = false;
        } },
        async update(problemId, payload) { this.saving = true; this.saveError = ''; try {
            await api.patch(`/problems/${problemId}`, payload);
            await this.fetch(problemId);
            return true;
        }
        catch (error) {
            this.saveError = error instanceof Error ? error.message : '题目保存失败';
            return false;
        }
        finally {
            this.saving = false;
        } },
        async remove(problemId) { this.deleting = true; this.deleteError = ''; try {
            await api.delete(`/problems/${problemId}`);
            this.problem = null;
            return true;
        }
        catch (error) {
            this.deleteError = error instanceof Error ? error.message : '题目删除失败';
            return false;
        }
        finally {
            this.deleting = false;
        } },
    },
});
