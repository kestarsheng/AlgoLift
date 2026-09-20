// 实现题目查询、创建、编辑与删除业务。
import { Prisma, Difficulty } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { cleanHtml, CreateProblemInput, ProblemQuery, UpdateProblemInput } from './problem.dto';

export class ProblemError extends Error { public constructor(public readonly code: string, message: string, public readonly statusCode: number) { super(message); } }
const include = { categories: { include: { category: { select: { id: true, name: true } } } }, _count: { select: { practiceRecords: true, notes: true } }, practiceRecords: { orderBy: { practicedAt: 'desc' as const }, take: 1, select: { practicedAt: true } } } as const;
const summary = (problem: Prisma.ProblemGetPayload<{ include: typeof include }>) => ({ id: problem.id, title: problem.title, difficulty: problem.difficulty, internalNote: problem.internalNote, categories: problem.categories.map(({ category }) => category), practiceCount: problem._count.practiceRecords, noteCount: problem._count.notes, lastPracticedAt: problem.practiceRecords[0]?.practicedAt ?? null, createdAt: problem.createdAt, updatedAt: problem.updatedAt });
const detail = async (userId: string, problemId: string) => {
  const problem = await prisma.problem.findFirst({ where: { id: problemId, userId }, include: { categories: { include: { category: { select: { id: true, name: true } } } }, practiceRecords: { orderBy: { practicedAt: 'desc' }, select: { id: true, practicedAt: true, solvedFirstTry: true, remark: true } }, notes: { include: { note: { select: { id: true, title: true } } } } } });
  if (!problem) throw new ProblemError('PROBLEM_NOT_FOUND', 'Problem does not exist', 404);
  return { data: { ...problem, categories: problem.categories.map(({ category }) => category), notes: problem.notes.map(({ note }) => note) } };
};
export const listProblems = async (userId: string, query: ProblemQuery) => {
  const where: Prisma.ProblemWhereInput = { userId, ...(query.keyword ? { title: { contains: query.keyword, mode: 'insensitive' } } : {}), ...(query.difficulty ? { difficulty: query.difficulty } : {}), ...(query.categoryId ? { categories: { some: { categoryId: query.categoryId } } } : {}) };
  if (query.categoryId && !(await prisma.category.findFirst({ where: { id: query.categoryId, userId }, select: { id: true } }))) throw new ProblemError('CATEGORY_NOT_FOUND', 'Category does not exist', 404);
  const [total, rows] = await prisma.$transaction([prisma.problem.count({ where }), prisma.problem.findMany({ where, include, orderBy: { title: 'asc' }, skip: (query.page - 1) * query.pageSize, take: query.pageSize })]);
  return { data: rows.map(summary), pagination: { page: query.page, pageSize: query.pageSize, total, totalPages: Math.ceil(total / query.pageSize) } };
};
export const getProblem = detail;
export const createProblem = async (userId: string, input: CreateProblemInput) => {
  try { const problem = await prisma.$transaction(async (tx) => { const categories = input.categoryIds?.length ? await tx.category.findMany({ where: { userId, id: { in: input.categoryIds } }, select: { id: true } }) : []; if (categories.length !== (input.categoryIds?.length ?? 0)) throw new ProblemError('CATEGORY_ACCESS_DENIED', 'One or more categories are unavailable', 403); return tx.problem.create({ data: { userId, title: input.title.trim(), difficulty: input.difficulty, internalNote: input.internalNote === undefined || input.internalNote === null ? null : cleanHtml(input.internalNote), categories: { create: categories.map(({ id: categoryId }) => ({ categoryId })) } }, include }); }); return { data: summary(problem) }; }
  catch (error: unknown) { if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') throw new ProblemError('PROBLEM_TITLE_EXISTS', 'Problem title already exists', 409); throw error; }
};
export const updateProblem = async (userId: string, problemId: string, input: UpdateProblemInput) => {
  try { const problem = await prisma.problem.update({ where: { id: problemId, userId }, data: { ...(input.title === undefined ? {} : { title: input.title.trim() }), ...(input.difficulty === undefined ? {} : { difficulty: input.difficulty }), ...(input.internalNote === undefined ? {} : { internalNote: input.internalNote === null ? null : cleanHtml(input.internalNote) }) }, include }); return { data: summary(problem) }; }
  catch (error: unknown) { if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') throw new ProblemError('PROBLEM_NOT_FOUND', 'Problem does not exist', 404); if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') throw new ProblemError('PROBLEM_TITLE_EXISTS', 'Problem title already exists', 409); throw error; }
};
export const deleteProblem = async (userId: string, problemId: string): Promise<void> => { try { await prisma.problem.delete({ where: { id: problemId, userId } }); } catch (error: unknown) { if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') throw new ProblemError('PROBLEM_NOT_FOUND', 'Problem does not exist', 404); throw error; } };
