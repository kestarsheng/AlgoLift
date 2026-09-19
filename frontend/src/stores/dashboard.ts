import { defineStore } from 'pinia';
import { api } from '../api';
import type { Category, NoteListItem, Pagination, Progress, ProblemListItem, Todo, WrongListItem } from '../types';
interface Page<T> { data: T[]; pagination: Pagination }
interface Module<T> { data: T; error: string }
const empty = <T>(): Page<T> => ({ data: [], pagination: { page: 1, pageSize: 1, total: 0, totalPages: 0 } });
const message = (error: unknown, fallback: string): string => error instanceof Error ? error.message : fallback;
export const useDashboardStore = defineStore('dashboard', {
  state: () => ({ loading: false, categories: { data: [] as Category[], error: '' } as Module<Category[]>, problems: { data: empty<ProblemListItem>(), error: '' } as Module<Page<ProblemListItem>>, wrongs: { data: empty<WrongListItem>(), error: '' } as Module<Page<WrongListItem>>, notes: { data: empty<NoteListItem>(), error: '' } as Module<Page<NoteListItem>>, todos: { data: empty<Todo>(), error: '' } as Module<Page<Todo>>, incompleteTodos: { data: empty<Todo>(), error: '' } as Module<Page<Todo>>, overdueTodos: { data: empty<Todo>(), error: '' } as Module<Page<Todo>>, progress: { data: empty<Progress>(), error: '' } as Module<Page<Progress>> }),
  getters: { averageProgress: (state): number => state.progress.data.data.length ? Math.round(state.progress.data.data.reduce((sum, item) => sum + item.progress, 0) / state.progress.data.data.length) : 0, latestProgress: (state): Progress | null => state.progress.data.data[0] ?? null, hasErrors: (state): boolean => [state.categories, state.problems, state.wrongs, state.notes, state.todos, state.incompleteTodos, state.overdueTodos, state.progress].some((item) => Boolean(item.error)) },
  actions: {
    async fetch(): Promise<void> {
      this.loading = true; const page = { page: 1, pageSize: 10 }; const run = async <T>(request: Promise<{ data: T }>, target: Module<T>, fallback: string): Promise<void> => { try { target.data = (await request).data; target.error = ''; } catch (error: unknown) { target.error = message(error, fallback); } };
      const categoryRequest = api.get<{ data: Category[] }>('/categories', { params: { includeEmpty: true } }).then((response) => ({ data: response.data.data }));
      await Promise.all([run(categoryRequest, this.categories, '分类加载失败'), run(api.get<Page<ProblemListItem>>('/problems', { params: { page: 1, pageSize: 1 } }), this.problems, '题目加载失败'), run(api.get<Page<WrongListItem>>('/wrongs', { params: page }), this.wrongs, '错题加载失败'), run(api.get<Page<NoteListItem>>('/notes', { params: page }), this.notes, '笔记加载失败'), run(api.get<Page<Todo>>('/todos', { params: page }), this.todos, '待办加载失败'), run(api.get<Page<Todo>>('/todos', { params: { ...page, status: 'TODO' } }), this.incompleteTodos, '未完成待办加载失败'), run(api.get<Page<Todo>>('/todos', { params: { ...page, overdue: true } }), this.overdueTodos, '逾期待办加载失败'), run(api.get<Page<Progress>>('/progresses', { params: page }), this.progress, '进度加载失败')]); this.loading = false;
    },
  },
});
