import { flushPromises, mount } from '@vue/test-utils';
import { createPinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ThemeSwitcher from '../src/components/ThemeSwitcher.vue';
import { useThemeStore } from '../src/stores/theme';

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
});

describe('ThemeSwitcher', () => {
  it('applies a chosen theme and persists it', async () => {
    const wrapper = mount(ThemeSwitcher, { global: { plugins: [createPinia()] } });
    const store = useThemeStore();
    store.init();
    expect(store.theme).toBe('dawn');
    await wrapper.find('button[title="切换主题"]').trigger('click');
    const options = wrapper.findAll('[role="option"]');
    expect(options.length).toBe(8);
    await options[1].trigger('click');
    expect(document.documentElement.dataset.theme).toBe('warm');
    expect(localStorage.getItem('algolift-theme')).toBe('warm');
  });

  it('highlights the active option and applies it on init', async () => {
    const wrapper = mount(ThemeSwitcher, { global: { plugins: [createPinia()] } });
    const store = useThemeStore();
    store.apply('sky');
    await wrapper.find('button[title="切换主题"]').trigger('click');
    const sky = wrapper.findAll('[role="option"]').find((option) => option.text().includes('Sky'));
    expect(sky?.attributes('aria-selected')).toBe('true');
    expect(document.documentElement.dataset.theme).toBe('sky');
  });

  it('throws no errors under a 375px viewport', () => {
    vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(375);
    expect(() => mount(ThemeSwitcher, { global: { plugins: [createPinia()] } })).not.toThrow();
    void flushPromises();
  });
});