// Authentication state, JWT persistence, and account actions.
import { defineStore } from 'pinia';
import { api } from '../api';
export const useAuthStore = defineStore('auth', { state: () => ({ token: localStorage.getItem('algolift_token'), user: null, loading: false, loginError: '', registerError: '' }), getters: { isAuthenticated: (state) => Boolean(state.token) }, actions: {
        saveSession(response) { this.token = response.token; this.user = response.user; localStorage.setItem('algolift_token', response.token); },
        clearSession() { this.token = null; this.user = null; localStorage.removeItem('algolift_token'); },
        async login(email, password) { this.loading = true; this.loginError = ''; try {
            this.saveSession((await api.post('/auth/login', { email, password })).data);
            return true;
        }
        catch (error) {
            this.loginError = error instanceof Error ? error.message : '登录失败';
            return false;
        }
        finally {
            this.loading = false;
        } },
        async register(email, password, displayName) { this.loading = true; this.registerError = ''; try {
            this.saveSession((await api.post('/auth/register', { email, password, displayName: displayName || undefined })).data);
            return true;
        }
        catch (error) {
            this.registerError = error instanceof Error ? error.message : '注册失败';
            return false;
        }
        finally {
            this.loading = false;
        } },
        async fetchCurrentUser() { if (!this.token)
            return false; try {
            this.user = (await api.get('/auth/me')).data.user;
            return true;
        }
        catch {
            this.clearSession();
            return false;
        } },
        logout() { this.clearSession(); }
    } });
