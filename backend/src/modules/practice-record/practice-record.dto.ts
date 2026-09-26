// 定义练习记录接口的请求参数与分页查询校验。
export interface CreatePracticeRecordInput { practicedAt: string; solvedFirstTry: boolean; remark?: string | null }
export interface UpdatePracticeRecordInput { practicedAt?: string; solvedFirstTry?: boolean; remark?: string | null }
export interface PracticeRecordQuery { page: number; pageSize: number }
export const isCreatePracticeRecordInput = (value: unknown): value is CreatePracticeRecordInput => {
  if (!value || typeof value !== 'object') return false;
  const input = value as Partial<CreatePracticeRecordInput>;
  return typeof input.practicedAt === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(input.practicedAt) && typeof input.solvedFirstTry === 'boolean' && (input.remark === undefined || input.remark === null || typeof input.remark === 'string');
};
export const isUpdatePracticeRecordInput = (value: unknown): value is UpdatePracticeRecordInput => {
  if (!value || typeof value !== 'object') return false;
  const input = value as Partial<UpdatePracticeRecordInput>;
  if (input.practicedAt !== undefined && (typeof input.practicedAt !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(input.practicedAt))) return false;
  if (input.solvedFirstTry !== undefined && typeof input.solvedFirstTry !== 'boolean') return false;
  if (input.remark !== undefined && input.remark !== null && typeof input.remark !== 'string') return false;
  return input.practicedAt !== undefined || input.solvedFirstTry !== undefined || input.remark !== undefined;
};
export const parsePracticeRecordQuery = (query: Record<string, unknown>): PracticeRecordQuery => {
  const page = Number(query.page) || 1; const pageSize = Number(query.pageSize) || 20;
  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100) throw new Error('INVALID_QUERY');
  return { page, pageSize };
};
