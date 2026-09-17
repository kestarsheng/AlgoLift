// 定义分类模块的请求参数校验与类型。
export interface CategoryInput { name: string }
export interface CategoryQuery { keyword?: string; includeEmpty: boolean }
export interface CategoryIdsInput { categoryIds: string[] }

export const isCategoryInput = (value: unknown): value is CategoryInput => {
  if (!value || typeof value !== 'object') return false;
  const name = (value as { name?: unknown }).name;
  return typeof name === 'string' && name.trim().length > 0 && name.trim().length <= 100;
};

export const isCategoryIdsInput = (value: unknown): value is CategoryIdsInput => {
  if (!value || typeof value !== 'object') return false;
  const ids = (value as { categoryIds?: unknown }).categoryIds;
  return Array.isArray(ids) && ids.every((id): id is string => typeof id === 'string' && id.length > 0) && new Set(ids).size === ids.length;
};

export const parseCategoryQuery = (query: Record<string, unknown>): CategoryQuery => ({
  keyword: typeof query.keyword === 'string' && query.keyword.trim() ? query.keyword.trim() : undefined,
  includeEmpty: query.includeEmpty === 'true'
});
