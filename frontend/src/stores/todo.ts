import { defineStore } from 'pinia';
import { api } from '../api';
import type { Pagination, Todo, TodoPriority, TodoStatus } from '../types';
import { createPagedCrudStore, errorMessage, type PagedCrudState } from './factory';
interface TodoResponse { data: Todo }
interface TodoInput { title: string; dueDate?: string; priority: TodoPriority; status: TodoStatus; remark?: string }
interface TodoListState extends PagedCrudState<Todo> { listError: string; deleting: boolean; deleteError: string; status: TodoStatus | ''; priority: TodoPriority | ''; overdue: boolean; totalCount: number; incompleteCount: number; overdueCount: number }
const base = createPagedCrudStore<Todo, TodoListState>({
  endpoint: '/todos',
  errorMessages: { fetch: '待办加载失败', delete: '待办删除失败' },
  listErrorField: 'listError',
  withDelete: true,
  buildParams: (state) => ({ page: state.pagination.page, pageSize: state.pagination.pageSize, keyword: state.keyword || undefined, status: state.status || undefined, priority: state.priority || undefined, overdue: state.overdue || undefined }),
});
export const useTodoStore = defineStore('todo', {
  state: () => ({ items: [] as Todo[], pagination: { page: 1, pageSize: 9, total: 0, totalPages: 0 } as Pagination, keyword: '', status: '' as TodoStatus | '', priority: '' as TodoPriority | '', overdue: false, loading: false, saving: false, deleting: false, listError: '', saveError: '', deleteError: '', totalCount: 0, incompleteCount: 0, overdueCount: 0 }),
  actions: {
    ...base.actions,
    async fetchSummaries(): Promise<void> { try { const [all, done, overdue] = await Promise.all([api.get<{ data: Todo[]; pagination: Pagination }>('/todos', { params: { page: 1, pageSize: 1 } }), api.get<{ data: Todo[]; pagination: Pagination }>('/todos', { params: { page: 1, pageSize: 1, status: 'COMPLETED' } }), api.get<{ data: Todo[]; pagination: Pagination }>('/todos', { params: { page: 1, pageSize: 1, overdue: true } })]); this.totalCount = all.data.pagination.total; this.overdueCount = overdue.data.pagination.total; this.incompleteCount = Math.max(0, all.data.pagination.total - done.data.pagination.total); } catch { /* keep previous counts */ } },
    async create(input: TodoInput): Promise<Todo | null> { this.saving = true; this.saveError = ''; try { const response = await api.post<TodoResponse>('/todos', input); await this.fetch(); return response.data.data; } catch (error: unknown) { this.saveError = errorMessage(error, '待办保存失败'); return null; } finally { this.saving = false; } },
    async get(id: string): Promise<Todo | null> { try { return (await api.get<TodoResponse>(`/todos/${id}`)).data.data; } catch (error: unknown) { this.saveError = errorMessage(error, '待办加载失败'); return null; } },
    async update(id: string, input: Partial<TodoInput>): Promise<Todo | null> { this.saving = true; this.saveError = ''; try { const response = await api.patch<TodoResponse>(`/todos/${id}`, input); await this.fetch(); return response.data.data; } catch (error: unknown) { this.saveError = errorMessage(error, '待办保存失败'); return null; } finally { this.saving = false; } },
    async toggle(todo: Todo): Promise<Todo | null> { return this.update(todo.id, { status: todo.status === 'COMPLETED' ? 'TODO' : 'COMPLETED' }); },
  },
});
