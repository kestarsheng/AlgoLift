// 全局搜索查询参数解析与类型定义。
export interface SearchQuery { keyword: string }
export interface SearchResultItem { id: string; title: string; }
export interface ProblemSearchItem extends SearchResultItem { difficulty: string; }
export interface WrongSearchItem extends SearchResultItem { difficulty: string; }
export interface NoteSearchItem extends SearchResultItem { }
export interface TodoSearchItem extends SearchResultItem { status: string; priority: string; }
export interface SearchResponse { problems: ProblemSearchItem[]; wrongs: WrongSearchItem[]; notes: NoteSearchItem[]; todos: TodoSearchItem[]; }
export const parseSearchQuery = (query: unknown): SearchQuery => {
  const q = (query as Record<string, unknown>)?.q;
  const keyword = typeof q === 'string' ? q.trim() : '';
  return { keyword };
};