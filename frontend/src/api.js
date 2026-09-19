// Axios client with the shared API error normalization.
import axios from 'axios';
import { useAuthStore } from './stores/auth';
import { router } from './router';
export const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api' });
api.interceptors.request.use((config) => { const token = localStorage.getItem('algolift_token'); if (token)
    config.headers.Authorization = `Bearer ${token}`; return config; });
api.interceptors.response.use((response) => response, (error) => { if (error.response?.status === 401) {
    useAuthStore().clearSession();
    if (router.currentRoute.value.path !== '/login')
        void router.push('/login');
} const message = error.response?.data?.message ?? '请求失败'; return Promise.reject(new Error(message)); });
