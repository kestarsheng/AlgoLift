// Shared frontend models for list and detail screens.
export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';
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
