import { flushPromises, mount } from '@vue/test-utils';
import { createPinia } from 'pinia';
import { describe, expect, it, vi } from 'vitest';
import Login from '../src/views/Login.vue';
import Register from '../src/views/Register.vue';
import { useAuthStore } from '../src/stores/auth';
import { createMemoryHistory, createRouter } from 'vue-router';
const testRouter = () => createRouter({ history: createMemoryHistory(), routes: [{ path: '/categories', component: {} }, { path: '/register', component: {} }, { path: '/login', component: {} }] });
describe('authentication views', () => {
  it('submits login and navigates after success', async () => { const router = testRouter(); const wrapper = mount(Login, { global: { plugins: [createPinia(), router] } }); vi.spyOn(useAuthStore(), 'login').mockResolvedValue(true); await wrapper.get('input[type="email"]').setValue('a@example.com'); await wrapper.get('input[type="password"]').setValue('password'); await wrapper.get('form').trigger('submit'); await flushPromises(); expect(router.currentRoute.value.path).toBe('/categories'); expect(wrapper.find('input[required]').exists()).toBe(true); });
  it('shows registration failure', async () => { const wrapper = mount(Register, { global: { plugins: [createPinia(), testRouter()] } }); vi.spyOn(useAuthStore(), 'register').mockResolvedValue(false); const store = useAuthStore(); store.registerError = '邮箱已存在'; await wrapper.get('form').trigger('submit'); expect(wrapper.text()).toContain('邮箱已存在'); });
});
