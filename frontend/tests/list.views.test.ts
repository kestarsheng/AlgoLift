import { flushPromises, mount } from '@vue/test-utils';
import { createPinia } from 'pinia';
import { describe, expect, it, vi } from 'vitest';
import { api } from '../src/api';
import WrongList from '../src/views/WrongList.vue';
import NoteList from '../src/views/NoteList.vue';
vi.mock('../src/api', () => ({ api: { get: vi.fn() } }));
const router = { push: vi.fn() };
describe('list views', () => { it('renders wrong empty state', async () => { vi.mocked(api.get).mockResolvedValueOnce({ data: { data: [], pagination: { page: 1, pageSize: 10, total: 0, totalPages: 0 } } }); const wrapper = mount(WrongList, { global: { plugins: [createPinia()], mocks: { $router: router } } }); await flushPromises(); expect(wrapper.text()).toContain('这里还没有匹配的错题'); }); it('renders note cards', async () => { vi.mocked(api.get).mockResolvedValueOnce({ data: { data: [{ id: 'n1', title: '二分笔记', content: '<p>边界</p>', problemCount: 2, wrongCount: 1 }], pagination: { page: 1, pageSize: 10, total: 1, totalPages: 1 } } }); const wrapper = mount(NoteList, { global: { plugins: [createPinia()], mocks: { $router: router } } }); await flushPromises(); expect(wrapper.text()).toContain('二分笔记'); expect(wrapper.text()).toContain('2 道关联题目'); }); });
