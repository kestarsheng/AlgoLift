// 实现全局搜索业务，按类型分组返回标题模糊命中结果。
import { prisma } from '../../config/prisma';
import { SearchResponse, SearchQuery } from './search.dto';
const take = 5;
export const search = async (userId: string, query: SearchQuery): Promise<{ data: SearchResponse }> => {
  if (!query.keyword) return { data: { problems: [], wrongs: [], notes: [], todos: [] } };
  const titleContains = { contains: query.keyword, mode: 'insensitive' as const };
  const [problems, wrongs, notes, todos] = await Promise.all([
    prisma.problem.findMany({ where: { userId, title: titleContains }, select: { id: true, title: true, difficulty: true }, take, orderBy: { updatedAt: 'desc' } }),
    prisma.wrong.findMany({ where: { userId, title: titleContains }, select: { id: true, title: true, difficulty: true }, take, orderBy: { updatedAt: 'desc' } }),
    prisma.note.findMany({ where: { userId, title: titleContains }, select: { id: true, title: true }, take, orderBy: { updatedAt: 'desc' } }),
    prisma.todo.findMany({ where: { userId, title: titleContains }, select: { id: true, title: true, status: true, priority: true }, take, orderBy: { updatedAt: 'desc' } }),
  ]);
  return { data: { problems, wrongs, notes, todos } };
};