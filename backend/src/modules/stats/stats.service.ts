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