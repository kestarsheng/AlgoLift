// 定义题解笔记 CRUD 的请求参数与校验。
export interface SolutionLink { name: string; url: string }
export interface NoteInput { title: string; content: string; solutionLinks: SolutionLink[] }
export interface NotePatch { title?: string; content?: string; solutionLinks?: SolutionLink[] }
export interface NoteQuery { page: number; pageSize: number; keyword?: string }

const validLinks = (value: unknown): value is SolutionLink[] => Array.isArray(value) && value.length <= 20 && value.every((link) => {
  if (!link || typeof link !== 'object') return false;
  const item = link as { name?: unknown; url?: unknown };
  return typeof item.name === 'string' && item.name.trim().length <= 100 && typeof item.url === 'string' && /^https?:\/\//.test(item.url);
});
export const isNoteInput = (value: unknown): value is NoteInput => {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<NoteInput>;
  return typeof item.title === 'string' && item.title.trim().length > 0 && item.title.trim().length <= 200 && typeof item.content === 'string' && item.content.length <= 100000 && validLinks(item.solutionLinks);
};
export const isNotePatch = (value: unknown): value is NotePatch => {
  if (!value || typeof value !== 'object') return false;
  const item = value as NotePatch;
  return Object.keys(item).length > 0 && (item.title === undefined || (typeof item.title === 'string' && item.title.trim().length > 0 && item.title.trim().length <= 200)) && (item.content === undefined || (typeof item.content === 'string' && item.content.length <= 100000)) && (item.solutionLinks === undefined || validLinks(item.solutionLinks));
};
export const parseNoteQuery = (query: Record<string, unknown>): NoteQuery => ({ page: Math.max(1, Number(query.page) || 1), pageSize: Math.min(100, Math.max(1, Number(query.pageSize) || 20)), keyword: typeof query.keyword === 'string' && query.keyword.trim() ? query.keyword.trim() : undefined });
