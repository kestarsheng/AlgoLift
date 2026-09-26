// 定义题目 CRUD 接口的请求类型、查询类型与输入校验。
import { Difficulty } from '@prisma/client';


export interface CreateProblemInput { title: string; difficulty: Difficulty; internalNote?: string | null; categoryIds?: string[] }
export interface UpdateProblemInput { title?: string; difficulty?: Difficulty; internalNote?: string | null }
export interface ProblemQuery { page: number; pageSize: number; keyword?: string; difficulty?: Difficulty; categoryId?: string }

const difficulties = new Set<Difficulty>(['EASY', 'MEDIUM', 'HARD']);
const validText = (value: unknown, maxLength: number): value is string => typeof value === 'string' && value.trim().length > 0 && value.trim().length <= maxLength;
const validDifficulty = (value: unknown): value is Difficulty => typeof value === 'string' && difficulties.has(value as Difficulty);
const validIds = (value: unknown): value is string[] => Array.isArray(value) && value.every((id) => typeof id === 'string' && id.length > 0) && new Set(value).size === value.length;


export const isCreateProblemInput = (value: unknown): value is CreateProblemInput => {
  if (!value || typeof value !== 'object') return false;
  const input = value as Partial<CreateProblemInput>;
  return validText(input.title, 255) && validDifficulty(input.difficulty) && (input.internalNote === undefined || input.internalNote === null || typeof input.internalNote === 'string') && (input.categoryIds === undefined || validIds(input.categoryIds));
};
export const isUpdateProblemInput = (value: unknown): value is UpdateProblemInput => {
  if (!value || typeof value !== 'object') return false;
  const input = value as Partial<UpdateProblemInput>;
  return Object.keys(input).length > 0 && (input.title === undefined || validText(input.title, 255)) && (input.difficulty === undefined || validDifficulty(input.difficulty)) && (input.internalNote === undefined || input.internalNote === null || typeof input.internalNote === 'string');
};
export const parseProblemQuery = (query: Record<string, unknown>): ProblemQuery => {
  const page = Number(query.page) || 1;
  const pageSize = Number(query.pageSize) || 20;
  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100) throw new Error('INVALID_QUERY');
  const difficulty = query.difficulty === undefined ? undefined : validDifficulty(query.difficulty) ? query.difficulty : undefined;
  if (query.difficulty !== undefined && !difficulty) throw new Error('INVALID_QUERY');
  return { page, pageSize, keyword: typeof query.keyword === 'string' && query.keyword.trim() ? query.keyword.trim() : undefined, difficulty, categoryId: typeof query.categoryId === 'string' && query.categoryId ? query.categoryId : undefined };
};
