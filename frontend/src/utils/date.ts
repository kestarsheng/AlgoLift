/**
 * 日期处理工具函数
 */

/** 将 ISO 8601 日期字符串（如 2026-09-25T00:00:00.000Z）格式化为 YYYY-MM-DD（如 2026-09-25）。 */
export const formatDate = (value: string | null | undefined): string => {
  if (!value) return '—';
  return value.slice(0, 10);
};
/** 返回本地时区今天的日期字符串 YYYY-MM-DD。 */
export const todayStr = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};