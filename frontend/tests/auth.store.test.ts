import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { api } from '../src/api';
import { useAuthStore } from '../src/stores/auth';
import type { User } from '../src/types';
vi.mock('../src/api', () => ({ api: { post: vi.fn(), get: vi.fn() } }));
const user: User = { id: 'u1', email: 'a@example.com', displayName: 'A', theme: 'BLUE' };
beforeEach(() => { localStorage.clear(); setActivePinia(createPinia()); vi.clearAllMocks(); });
describe('auth store', () => {
  it('saves login token and user', async () => { vi.mocked(api.post).mockResolvedValue({ data: { token: 'jwt', user } }); const store = useAuthStore(); expect(await store.login(user.email, 'password')).toBe(true); expect(store.token).toBe('jwt'); expect(store.user).toEqual(user); expect(localStorage.getItem('algolift_token')).toBe('jwt'); });
  it('stores login errors and clears session on logout', async () => { vi.mocked(api.post).mockRejectedValue(new Error('凭证错误')); const store = useAuthStore(); expect(await store.login(user.email, 'bad')).toBe(false); expect(store.loginError).toBe('凭证错误'); store.logout(); expect(store.isAuthenticated).toBe(false); expect(localStorage.getItem('algolift_token')).toBeNull(); });
  it('registers, restores the current user, and starts from persisted token', async () => { localStorage.setItem('algolift_token', 'old'); const store = useAuthStore(); expect(store.token).toBe('old'); vi.mocked(api.post).mockResolvedValue({ data: { token: 'new', user } }); expect(await store.register(user.email, 'password', 'A')).toBe(true); vi.mocked(api.get).mockResolvedValue({ data: { user } }); expect(await store.fetchCurrentUser()).toBe(true); expect(store.user).toEqual(user); });
});
