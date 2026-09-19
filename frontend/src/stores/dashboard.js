import { defineStore } from 'pinia';
import { api } from '../api';
const empty = () => ({ data: [], pagination: { page: 1, pageSize: 1, total: 0, totalPages: 0 } });
const message = (error, fallback) => error instanceof Error ? error.message : fallback;
export const useDashboardStore = defineStore('dashboard', {
    state: () => ({ loading: false, categories: { data: [], error: '' }, problems: { data: empty(), error: '' }, wrongs: { data: empty(), error: '' }, notes: { data: empty(), error: '' }, todos: { data: empty(), error: '' }, incompleteTodos: { data: empty(), error: '' }, overdueTodos: { data: empty(), error: '' }, progress: { data: empty(), error: '' } }),
    getters: { averageProgress: (state) => state.progress.data.data.length ? Math.round(state.progress.data.data.reduce((sum, item) => sum + item.progress, 0) / state.progress.data.data.length) : 0, latestProgress: (state) => state.progress.data.data[0] ?? null, hasErrors: (state) => [state.categories, state.problems, state.wrongs, state.notes, state.todos, state.incompleteTodos, state.overdueTodos, state.progress].some((item) => Boolean(item.error)) },
    actions: {
        async fetch() {
            this.loading = true;
            const page = { page: 1, pageSize: 10 };
            const run = async (request, target, fallback) => { try {
                target.data = (await request).data;
                target.error = '';
            }
            catch (error) {
                target.error = message(error, fallback);
            } };
            const categoryRequest = api.get('/categories', { params: { includeEmpty: true } }).then((response) => ({ data: response.data.data }));
            await Promise.all([run(categoryRequest, this.categories, '分类加载失败'), run(api.get('/problems', { params: { page: 1, pageSize: 1 } }), this.problems, '题目加载失败'), run(api.get('/wrongs', { params: page }), this.wrongs, '错题加载失败'), run(api.get('/notes', { params: page }), this.notes, '笔记加载失败'), run(api.get('/todos', { params: page }), this.todos, '待办加载失败'), run(api.get('/todos', { params: { ...page, status: 'TODO' } }), this.incompleteTodos, '未完成待办加载失败'), run(api.get('/todos', { params: { ...page, overdue: true } }), this.overdueTodos, '逾期待办加载失败'), run(api.get('/progresses', { params: page }), this.progress, '进度加载失败')]);
            this.loading = false;
        },
    },
});
