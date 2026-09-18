// 定义错题关联笔记接口的请求类型与校验。
export interface NoteIdsInput { noteIds: string[] }

export const isNoteIdsInput = (value: unknown): value is NoteIdsInput => {
  if (!value || typeof value !== 'object') return false;
  const ids = (value as { noteIds?: unknown }).noteIds;
  return Array.isArray(ids) && ids.every((id): id is string => typeof id === 'string' && id.length > 0) && new Set(ids).size === ids.length;
};
