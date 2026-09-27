// 数据概览聚合 store：并行加载分类/题目/错题/笔记/待办/进度/统计，并派生掌握度与热力图。
import { defineStore } from 'pinia';
import { api } from '../api';
import { todayStr } from '../utils/date';
import type { Category, DashboardStats, NoteListItem, Pagination, Progress, ProblemListItem, Todo, WrongListItem } from '../types';

interface Page<T> { data: T[]; pagination: Pagination }
interface Module<T> { data: T; error: string }
const empty = <T>(): Page<T> => ({ data: [], pagination: { page: 1, pageSize: 1, total: 0, totalPages: 0 } });
const message = (error: unknown, fallback: string): string => error instanceof Error ? error.message : fallback;
const HEATMAP_WEEKS = 52; const HEATMAP_DAYS = HEATMAP_WEEKS * 7;

export interface HeatmapDay { date: string; count: number; level: number }
export interface MasteryItem { id: string; name: string; percent: number }
export interface KnowledgeItem { id: string; title: string; percent: number; description: string }

const localDateStr = (d: Date): string => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const utcToLocalStr = (utc: string): string => localDateStr(new Date(`${utc}T00:00:00.000Z`));
const buildHeatmap = (dailyPractice: { date: string; count: number }[]): HeatmapDay[] => {
  const counts = new Map(dailyPractice.map((item) => [utcToLocalStr(item.date), item.count]));
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const thisSunday = new Date(today); thisSunday.setDate(today.getDate() - today.getDay());
  const start = new Date(thisSunday); start.setDate(thisSunday.getDate() - (HEATMAP_WEEKS - 1) * 7);
  const days: HeatmapDay[] = [];
  for (let index = 0; index < HEATMAP_DAYS; index++) { const day = new Date(start); day.setDate(start.getDate() + index); const date = localDateStr(day); if (day > today) { days.push({ date: '', count: 0, level: -1 }); } else { const count = counts.get(date) ?? 0; days.push({ date, count, level: count === 0 ? 0 : count <= 2 ? 1 : count <= 4 ? 2 : count <= 6 ? 3 : 4 }); } }
  return days;
};

export const useDashboardStore = defineStore('dashboard', {
  state: () => ({ loading: false, categories: { data: [] as Category[], error: '' } as Module<Category[]>, problems: { data: empty<ProblemListItem>(), error: '' } as Module<Page<ProblemListItem>>, wrongs: { data: empty<WrongListItem>(), error: '' } as Module<Page<WrongListItem>>, notes: { data: empty<NoteListItem>(), error: '' } as Module<Page<NoteListItem>>, todos: { data: empty<Todo>(), error: '' } as Module<Page<Todo>>, progress: { data: empty<Progress>(), error: '' } as Module<Page<Progress>>, stats: { data: { difficultyCounts: { EASY: 0, MEDIUM: 0, HARD: 0 }, dailyPractice: [], totalProblems: 0, completedProblems: 0, accuracy: 0 } as DashboardStats, error: '' } as Module<DashboardStats>, statsLoading: false }),
  getters: {
    averageProgress: (state): number => state.progress.data.data.length ? Math.round(state.progress.data.data.reduce((sum, item) => sum + item.progress, 0) / state.progress.data.data.length) : 0,
    latestProgress: (state): Progress | null => state.progress.data.data[0] ?? null,
    hasErrors: (state): boolean => [state.categories, state.problems, state.wrongs, state.notes, state.todos, state.progress, state.stats].some((item) => Boolean(item.error)),
    heatmapDays: (state): HeatmapDay[] => buildHeatmap(state.stats.data.dailyPractice),
    heatmapData: (state): HeatmapDay[] => buildHeatmap(state.stats.data.dailyPractice),
    totalProblems: (state): number => state.stats.data.totalProblems ?? 0,
    completedProblems: (state): number => state.stats.data.completedProblems ?? 0,
    accuracy: (state): number => state.stats.data.accuracy ?? 0,
    todayCount: (state): number => {
      const today = todayStr();
      return state.stats.data.dailyPractice.find((item) => utcToLocalStr(item.date) === today)?.count ?? 0;
    },
    streakDays: (state): number => {
      const counts = new Set(state.stats.data.dailyPractice.filter((item) => item.count > 0).map((item) => utcToLocalStr(item.date)));
      let streak = 0;
      const cursor = new Date(); cursor.setHours(0, 0, 0, 0);
      while (counts.has(localDateStr(cursor))) { streak += 1; cursor.setDate(cursor.getDate() - 1); }
      return streak;
    },
    categoryMastery: (state): MasteryItem[] => {
      const progressMap = new Map(state.progress.data.data.map((item) => [item.title, item.progress]));
      return state.categories.data
        .map((category) => ({ id: category.id, name: category.name, percent: progressMap.get(category.name) ?? 0 }))
        .sort((a, b) => b.percent - a.percent || a.name.localeCompare(b.name))
        .slice(0, 6);
    },
    recentMastered: (state): KnowledgeItem[] => state.progress.data.data.slice(0, 4).map((item) => ({ id: item.id, title: item.title, percent: item.progress, description: item.description ?? '' })),
  },
  actions: {
    async fetch(): Promise<void> {
      this.loading = true; const page = { page: 1, pageSize: 10 }; const run = async <T>(request: Promise<{ data: T }>, target: Module<T>, fallback: string): Promise<void> => { try { target.data = (await request).data; target.error = ''; } catch (error: unknown) { target.error = message(error, fallback); } };
      const categoryRequest = api.get<{ data: Category[] }>('/categories', { params: { includeEmpty: true } }).then((response) => ({ data: response.data.data }));
      await Promise.all([run(categoryRequest, this.categories, '分类加载失败'), run(api.get<Page<ProblemListItem>>('/problems', { params: { page: 1, pageSize: 1 } }), this.problems, '题目加载失败'), run(api.get<Page<WrongListItem>>('/wrongs', { params: page }), this.wrongs, '错题加载失败'), run(api.get<Page<NoteListItem>>('/notes', { params: page }), this.notes, '笔记加载失败'), run(api.get<Page<Todo>>('/todos', { params: page }), this.todos, '待办加载失败'), run(api.get<Page<Progress>>('/progresses', { params: page }), this.progress, '进度加载失败')]); this.loading = false;
    },
    async fetchStats(): Promise<void> { this.statsLoading = true; this.stats.error = ''; try { this.stats.data = (await api.get<DashboardStats>('/stats/dashboard', { params: { days: HEATMAP_DAYS } })).data; } catch (error: unknown) { this.stats.error = message(error, '统计数据加载失败'); } finally { this.statsLoading = false; } },
    async toggleTodo(todo: Todo): Promise<void> { try { await api.patch(`/todos/${todo.id}`, { status: todo.status === 'COMPLETED' ? 'TODO' : 'COMPLETED' }); const item = this.todos.data.data.find((t) => t.id === todo.id); if (item) item.status = todo.status === 'COMPLETED' ? 'TODO' : 'COMPLETED'; } catch (error: unknown) { this.todos.error = message(error, '待办更新失败'); } },
  },
});