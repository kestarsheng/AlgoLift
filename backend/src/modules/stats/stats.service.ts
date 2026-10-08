// 实现数据概览统计的聚合业务：难度分布、每日练习计数、题目总量、已完成题数与一遍做对率。
import { Difficulty } from '@prisma/client';
import { prisma } from '../../config/prisma';

export interface DailyPracticeCount { date: string; count: number }
export interface DashboardStats {
  difficultyCounts: Record<Difficulty, number>;
  dailyPractice: DailyPracticeCount[];
  totalProblems: number;
  completedProblems: number;
  accuracy: number;
}

export const getDashboardStats = async (userId: string, days: number): Promise<DashboardStats> => {
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  start.setUTCDate(start.getUTCDate() - (days - 1));
  const [difficultyGroups, dailyGroups, totalProblems, problemGroups, accuracyGroups] = await Promise.all([
    prisma.problem.groupBy({ by: ['difficulty'], where: { userId }, _count: { _all: true } }),
    prisma.practiceRecord.groupBy({ by: ['practicedAt'], where: { userId, practicedAt: { gte: start } }, _count: { _all: true } }),
    prisma.problem.count({ where: { userId } }),
    prisma.practiceRecord.groupBy({ by: ['problemId'], where: { userId }, _count: { _all: true } }),
    prisma.practiceRecord.groupBy({ by: ['solvedFirstTry'], where: { userId }, _count: { _all: true } })
  ]);
  const difficultyCounts: Record<Difficulty, number> = { EASY: 0, MEDIUM: 0, HARD: 0 };
  for (const group of difficultyGroups) difficultyCounts[group.difficulty] = group._count._all;
  const dailyPractice = dailyGroups
    .map((group) => ({ date: group.practicedAt.toISOString().slice(0, 10), count: group._count._all }))
    .sort((a, b) => a.date.localeCompare(b.date));
  const practiceTotal = accuracyGroups.reduce((sum, group) => sum + group._count._all, 0);
  const firstTryTotal = accuracyGroups.reduce((sum, group) => sum + (group.solvedFirstTry ? group._count._all : 0), 0);
  return {
    difficultyCounts,
    dailyPractice,
    totalProblems,
    completedProblems: problemGroups.length,
    accuracy: practiceTotal === 0 ? 0 : Math.round((firstTryTotal / practiceTotal) * 100)
  };
};
export interface Suggestion { type: string; title: string; description: string; priority: string; targetId?: string; targetType?: string; }
export interface SuggestionsResponse { suggestions: Suggestion[]; }

export const getSuggestions = async (userId: string): Promise<SuggestionsResponse> => {
  const suggestions: Suggestion[] = [];
  const [wrongsWithCategory, lowAccuracyProblems, unsolvedProblems, pendingTodos] = await Promise.all([
    prisma.wrong.findMany({ where: { userId, category: { not: null } }, select: { category: true } }),
    prisma.problem.findMany({ where: { userId, practiceRecords: { some: { solvedFirstTry: false } } }, select: { id: true, title: true, practiceRecords: { select: { solvedFirstTry: true } } }, take: 3, orderBy: { updatedAt: 'desc' } }),
    prisma.problem.findMany({ where: { userId, practiceRecords: { none: {} } }, select: { id: true, title: true, difficulty: true }, take: 3, orderBy: { createdAt: 'desc' } }),
    prisma.todo.findMany({ where: { userId, status: { not: 'COMPLETED' } }, select: { id: true, title: true, priority: true, dueDate: true }, take: 3, orderBy: { dueDate: 'asc' } }),
  ]);
  const categoryCounts = new Map<string, number>();
  for (const w of wrongsWithCategory) { if (w.category) categoryCounts.set(w.category, (categoryCounts.get(w.category) ?? 0) + 1); }
  const topCategory = [...categoryCounts.entries()].sort((a, b) => b[1] - a[1])[0];
  if (topCategory) {
    suggestions.push({ type: 'review_wrong', title: `复习错题集中的分类：${topCategory[0]}`, description: `该分类有 ${topCategory[1]} 道错题，优先攻克`, priority: 'high', targetType: 'wrong' });
  }
  const lowAccuracy = lowAccuracyProblems.find((p) => { const total = p.practiceRecords.length; const fail = p.practiceRecords.filter((r) => !r.solvedFirstTry).length; return total > 0 && fail / total >= 0.5; });
  if (lowAccuracy) {
    suggestions.push({ type: 'retry_low_accuracy', title: `重做低正确率题目：${lowAccuracy.title}`, description: '该题目一遍做对率低于 50%，建议再练一次', priority: 'high', targetId: lowAccuracy.id, targetType: 'problem' });
  }
  if (unsolvedProblems.length > 0) {
    suggestions.push({ type: 'practice_unsolved', title: `练习未做过的题目：${unsolvedProblems[0].title}`, description: `还有 ${unsolvedProblems.length} 道题目从未练习，开始刷题吧`, priority: 'medium', targetId: unsolvedProblems[0].id, targetType: 'problem' });
  }
  if (pendingTodos.length > 0) {
    suggestions.push({ type: 'complete_todo', title: `完成待办：${pendingTodos[0].title}`, description: `还有 ${pendingTodos.length} 项未完成待办，优先处理最近的`, priority: 'medium', targetId: pendingTodos[0].id, targetType: 'todo' });
  }
  if (suggestions.length === 0) {
    suggestions.push({ type: 'keep_going', title: '继续保持学习节奏', description: '暂无待处理的学习建议，继续每日刷题巩固吧', priority: 'low' });
  }
  return { suggestions };
};