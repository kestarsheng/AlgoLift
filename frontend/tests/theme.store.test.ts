import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useThemeStore, THEME_OPTIONS } from '../src/stores/theme';

describe('theme store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    vi.restoreAllMocks();
  });

  it('defaults to dawn and applies it to the document', () => {
    const store = useThemeStore();
    expect(store.theme).toBe('dawn');
    store.init();
    expect(document.documentElement.dataset.theme).toBe('dawn');
  });

  it('applies a theme, persists it, and reflects it in the document', () => {
    const store = useThemeStore();
    store.apply('warm');
    expect(store.theme).toBe('warm');
    expect(document.documentElement.dataset.theme).toBe('warm');
    expect(localStorage.getItem('algolift-theme')).toBe('warm');
    const next = useThemeStore();
    expect(next.theme).toBe('warm');
  });

  it('falls back to dawn when the stored value is invalid', () => {
    localStorage.setItem('algolift-theme', 'unknown-theme');
    const store = useThemeStore();
    expect(store.theme).toBe('dawn');
  });

  it('lists exactly eight theme options with labels and dots', () => {
    expect(THEME_OPTIONS).toHaveLength(8);
    expect(THEME_OPTIONS[0].label).toContain('Dawn');
    expect(THEME_OPTIONS.every((option) => option.dot.startsWith('#'))).toBe(true);
  });
});