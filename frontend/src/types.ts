// Shared frontend models for list and detail screens.
export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';
export interface SolutionLink { name: string; url: string }
export interface User { id: string; email: string; displayName: string | null; theme: string }
export interface Note { id: string; title: string; content: string | null; solutionLinks?: unknown; createdAt?: string; updatedAt?: string }
export interface NoteListItem extends Note { problemCount: number; wrongCount: number }
export interface Wrong { id: string; title: string; category?: string | null; difficulty: Difficulty; review?: string | null; solutionLinks?: unknown }
export interface WrongListItem extends Wrong { noteCount: number }
export interface Pagination { page: number; pageSize: number; total: number; totalPages: number }
export interface WrongNotesResponse { data: { wrongId: string; notes: Note[] } }
export interface Category { id: string; name: string; problemCount: number }
export interface ProblemListItem { id: string; title: string; difficulty: Difficulty; practiceCount: number; noteCount: number; lastPracticedAt: string | null }
export interface PracticeRecord { id: string; practicedAt: string; solvedFirstTry: boolean; remark: string | null }
export interface DailyPracticeCount { date: string; count: number }
export interface DashboardStats { difficultyCounts: Record<Difficulty, number>; dailyPractice: DailyPracticeCount[]; totalProblems: number; completedProblems: number; accuracy: number }
export type TodoPriority = 'P0' | 'P1' | 'P2';
export type TodoStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
export interface Todo { id: string; title: string; dueDate: string | null; priority: TodoPriority; status: TodoStatus; remark: string | null; isOverdue: boolean }
export interface Progress { id: string; title: string; progress: number; progressDate: string; description: string | null; createdAt?: string; updatedAt?: string }
