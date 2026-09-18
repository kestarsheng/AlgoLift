// 定义学习进度 CRUD 的请求参数与查询参数校验。
export interface ProgressInput { title: string; progress: number; progressDate: string; description?: string | null }
export interface ProgressPatch { title?: string; progress?: number; progressDate?: string; description?: string | null }
export interface ProgressQuery { page: number; pageSize: number; keyword?: string }

const validDate = (value: unknown): value is string => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
const validProgress = (value: unknown): value is number => typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 100;
const validDescription = (value: unknown): value is string | null | undefined => value === undefined || value === null || (typeof value === 'string' && value.length <= 10000);

export const isProgressInput = (value: unknown): value is ProgressInput => {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<ProgressInput>;
  return typeof item.title === 'string' && item.title.trim().length > 0 && item.title.trim().length <= 255 && validProgress(item.progress) && validDate(item.progressDate) && validDescription(item.description);
};
export const isProgressPatch = (value: unknown): value is ProgressPatch => {
  if (!value || typeof value !== 'object') return false;
  const item = value as ProgressPatch;
  return Object.keys(item).length > 0 && (item.title === undefined || (typeof item.title === 'string' && item.title.trim().length > 0 && item.title.trim().length <= 255)) && (item.progress === undefined || validProgress(item.progress)) && (item.progressDate === undefined || validDate(item.progressDate)) && validDescription(item.description);
};
export const parseProgressQuery = (query: Record<string, unknown>): ProgressQuery => ({ page: Math.max(1, Number(query.page) || 1), pageSize: Math.min(100, Math.max(1, Number(query.pageSize) || 20)), keyword: typeof query.keyword === 'string' && query.keyword.trim() ? query.keyword.trim() : undefined });
