// Authentication state, JWT persistence, and account actions.
import { defineStore } from 'pinia';
import { api } from '../api';
import type { User } from '../types';
interface AuthResponse { user: User; token: string }
export const useAuthStore = defineStore('auth', { state: () => ({ token: localStorage.getItem('algolift_token'), user: null as User | null, loading: false, loginError: '', registerError: '' }), getters: { isAuthenticated: (state): boolean => Boolean(state.token) }, actions: {
  saveSession(response: AuthResponse): void { this.token = response.token; this.user = response.user; localStorage.setItem('algolift_token', response.token); },
  clearSession(): void { this.token = null; this.user = null; localStorage.removeItem('algolift_token'); },
  async login(email: string, password: string): Promise<boolean> { this.loading = true; this.loginError = ''; try { this.saveSession((await api.post<AuthResponse>('/auth/login', { email, password })).data); return true; } catch (error: unknown) { this.loginError = error instanceof Error ? error.message : '登录失败'; return false; } finally { this.loading = false; } },
  async register(email: string, password: string, displayName: string): Promise<boolean> { this.loading = true; this.registerError = ''; try { this.saveSession((await api.post<AuthResponse>('/auth/register', { email, password, displayName: displayName || undefined })).data); return true; } catch (error: unknown) { this.registerError = error instanceof Error ? error.message : '注册失败'; return false; } finally { this.loading = false; } },
  async fetchCurrentUser(): Promise<boolean> { if (!this.token) return false; try { this.user = (await api.get<User>('/auth/me')).data; return true; } catch { this.clearSession(); return false; } },
  logout(): void { this.clearSession(); }
} });
