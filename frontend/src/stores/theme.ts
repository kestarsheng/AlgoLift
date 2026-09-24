// 主题偏好存储：切换 8 种设计 token 主题并持久化到 localStorage。
import { defineStore } from 'pinia';

export const THEME_KEYS = ['dawn', 'warm', 'mint', 'slate', 'orange', 'pink', 'black', 'sky'] as const;
export type ThemeKey = (typeof THEME_KEYS)[number];

export interface ThemeOption { key: ThemeKey; label: string; dot: string }

export const THEME_OPTIONS: ThemeOption[] = [
  { key: 'dawn', label: '浅蓝 Dawn', dot: '#5f82db' },
  { key: 'warm', label: '暖褐 Warm', dot: '#d48054' },
  { key: 'mint', label: '果绿 Mint', dot: '#52c48c' },
  { key: 'slate', label: '烟灰 Slate', dot: '#6870cc' },
  { key: 'orange', label: '橙 Orange', dot: '#e28a3d' },
  { key: 'pink', label: '粉 Pink', dot: '#db5e93' },
  { key: 'black', label: '曜黑 Black', dot: '#40bfb8' },
  { key: 'sky', label: '天蓝 Sky', dot: '#50b0d9' },
];

const STORAGE_KEY = 'algolift-theme';
const DEFAULT_THEME: ThemeKey = 'dawn';

const isThemeKey = (value: string | null): value is ThemeKey => value !== null && (THEME_KEYS as readonly string[]).includes(value);

const readStoredTheme = (): ThemeKey => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return isThemeKey(stored) ? stored : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
};

export const useThemeStore = defineStore('theme', {
  state: () => ({ theme: readStoredTheme() as ThemeKey }),
  actions: {
    apply(theme: ThemeKey): void {
      this.theme = theme;
      document.documentElement.dataset.theme = theme;
      try { localStorage.setItem(STORAGE_KEY, theme); } catch { /* storage 不可用时忽略 */ }
    },
    init(): void {
      document.documentElement.dataset.theme = this.theme;
    },
  },
});