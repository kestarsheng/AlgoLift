/**
 * 日期处理工具函数
 */

/** 将 ISO 8601 日期字符串（如 2026-09-25T00:00:00.000Z）格式化为 YYYY-MM-DD（如 2026-09-25）。 */
export const formatDate = (value: string | null | undefined): string => {
  if (!value) return '—';
  return value.slice(0, 10);
};