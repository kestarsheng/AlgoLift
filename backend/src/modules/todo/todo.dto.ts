// 定义待办 CRUD 的请求参数与查询参数校验。
import { TodoPriority, TodoStatus } from '@prisma/client';

export interface TodoInput { title: string; dueDate?: string | null; priority: TodoPriority; status?: TodoStatus; remark?: string | null }
export interface TodoPatch { title?: string; dueDate?: string | null; priority?: TodoPriority; status?: TodoStatus; remark?: string | null }
export interface TodoQuery { page: number; pageSize: number; status?: TodoStatus; priority?: TodoPriority; overdue?: boolean; keyword?: string }

const validDate = (value: unknown): value is string => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
const validEnum = <T extends string>(value: unknown, values: readonly T[]): value is T => typeof value === 'string' && values.includes(value as T);
const priorities = Object.values(TodoPriority);
const statuses = Object.values(TodoStatus);
const validDateValue = (value: unknown): value is string | null | undefined => value === undefined || value === null || validDate(value);

export const isTodoInput = (value: unknown): value is TodoInput => {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<TodoInput>;
  return typeof item.title === 'string' && item.title.trim().length > 0 && item.title.trim().length <= 255 && validDateValue(item.dueDate) && validEnum(item.priority, priorities) && (item.status === undefined || validEnum(item.status, statuses)) && (item.remark === undefined || item.remark === null || (typeof item.remark === 'string' && item.remark.length <= 10000));
};
export const isTodoPatch = (value: unknown): value is TodoPatch => {
  if (!value || typeof value !== 'object') return false;
  const item = value as TodoPatch;
  return Object.keys(item).length > 0 && (item.title === undefined || (typeof item.title === 'string' && item.title.trim().length > 0 && item.title.trim().length <= 255)) && validDateValue(item.dueDate) && (item.priority === undefined || validEnum(item.priority, priorities)) && (item.status === undefined || validEnum(item.status, statuses)) && (item.remark === undefined || item.remark === null || (typeof item.remark === 'string' && item.remark.length <= 10000));
};
export const parseTodoQuery = (query: Record<string, unknown>): TodoQuery => {
  const status = validEnum(query.status, statuses) ? query.status : undefined;
  const priority = validEnum(query.priority, priorities) ? query.priority : undefined;
  return { page: Math.max(1, Number(query.page) || 1), pageSize: Math.min(100, Math.max(1, Number(query.pageSize) || 20)), status, priority, overdue: query.overdue === 'true' ? true : query.overdue === 'false' ? false : undefined, keyword: typeof query.keyword === 'string' && query.keyword.trim() ? query.keyword.trim() : undefined };
};
