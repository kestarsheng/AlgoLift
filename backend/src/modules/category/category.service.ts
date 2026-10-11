// 实现分类查询、维护及题目分类关联业务。
import { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { CategoryIdsInput, CategoryInput, CategoryQuery } from './category.dto';
import { ApiError, assertRecordExists, handlePrismaNotFound } from '../../lib/errors';

const categorySelect = { id: true, name: true, createdAt: true, updatedAt: true, _count: { select: { problems: true } } } as const;
type CategoryRow = Prisma.CategoryGetPayload<{ select: typeof categorySelect }>;
const present = (category: CategoryRow) => ({ id: category.id, name: category.name, problemCount: category._count.problems, createdAt: category.createdAt, updatedAt: category.updatedAt });

export const listCategories = async (userId: string, query: CategoryQuery) => {
  const rows = await prisma.category.findMany({ where: { userId, ...(query.includeEmpty ? {} : { problems: { some: {} } }), ...(query.keyword ? { name: { contains: query.keyword, mode: 'insensitive' } } : {}) }, select: categorySelect, orderBy: { name: 'asc' } });
  return { data: rows.map(present) };
};

export const createCategory = async (userId: string, input: CategoryInput) => {
  try { return { data: present(await prisma.category.create({ data: { userId, name: input.name.trim() }, select: categorySelect })) }; }
  catch (error: unknown) { if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') throw new ApiError(409, 'CATEGORY_NAME_EXISTS', 'Category name already exists'); throw error; }
};

export const renameCategory = async (userId: string, categoryId: string, input: CategoryInput) => {
  try { return { data: present(await prisma.category.update({ where: { id: categoryId, userId }, data: { name: input.name.trim() }, select: categorySelect })) }; }
  catch (error: unknown) { if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') throw new ApiError(409, 'CATEGORY_NAME_EXISTS', 'Category name already exists'); if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') throw new ApiError(404, 'CATEGORY_NOT_FOUND', 'Category does not exist'); throw error; }
};

export const deleteCategory = async (userId: string, categoryId: string): Promise<void> => {
  try { await prisma.category.delete({ where: { id: categoryId, userId } }); }
  catch (error: unknown) { handlePrismaNotFound(error, 'CATEGORY_NOT_FOUND', 'Category does not exist'); }
};

export const listCategoryProblems = async (userId: string, categoryId: string, page: number, pageSize: number, keyword?: string, difficulty?: string) => {
  const category = await prisma.category.findFirst({ where: { id: categoryId, userId } });
  assertRecordExists(category, 'CATEGORY_NOT_FOUND', 'Category does not exist');
  const where = { userId, categories: { some: { categoryId } }, ...(keyword ? { title: { contains: keyword, mode: 'insensitive' as const } } : {}), ...(difficulty ? { difficulty: difficulty as 'EASY' | 'MEDIUM' | 'HARD' } : {}) };
  const [total, problems] = await prisma.$transaction([prisma.problem.count({ where }), prisma.problem.findMany({ where, orderBy: { title: 'asc' }, skip: (page - 1) * pageSize, take: pageSize, include: { _count: { select: { practiceRecords: true, notes: true } }, practiceRecords: { orderBy: { practicedAt: 'desc' }, take: 1, select: { practicedAt: true } } } })]);
  return { data: problems.map((problem) => ({ id: problem.id, title: problem.title, difficulty: problem.difficulty, practiceCount: problem._count.practiceRecords, noteCount: problem._count.notes, lastPracticedAt: problem.practiceRecords[0]?.practicedAt ?? null })), pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } };
};

export const replaceProblemCategories = async (userId: string, problemId: string, input: CategoryIdsInput) => {
  const result = await prisma.$transaction(async (tx) => {
    const problem = await tx.problem.findFirst({ where: { id: problemId, userId } });
    assertRecordExists(problem, 'PROBLEM_NOT_FOUND', 'Problem does not exist');
    const categories = await tx.category.findMany({ where: { userId, id: { in: input.categoryIds } }, select: categorySelect, orderBy: { name: 'asc' } });
    if (categories.length !== input.categoryIds.length) throw new ApiError(403, 'CATEGORY_ACCESS_DENIED', 'One or more categories are unavailable');
    await tx.problemCategory.deleteMany({ where: { problemId } });
    if (input.categoryIds.length) await tx.problemCategory.createMany({ data: input.categoryIds.map((categoryId) => ({ problemId, categoryId })) });
    return categories;
  });
  return { data: result.map(present) };
};
