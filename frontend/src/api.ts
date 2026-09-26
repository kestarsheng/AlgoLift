// Axios client with the shared API error normalization.
import axios, { AxiosError } from 'axios';
import { useAuthStore } from './stores/auth';
import { router } from './router';
export const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api' });
// ngrok's free tier answers browser-like requests with an HTML interstitial (ERR_NGROK_6024) that carries no CORS header; this opt-out header makes it proxy to the backend instead.
api.interceptors.request.use((config) => { const token = localStorage.getItem('algolift_token'); if (token) config.headers.Authorization = `Bearer ${token}`; config.headers['ngrok-skip-browser-warning'] = 'true'; return config; });
api.interceptors.response.use((response) => response, (error: AxiosError<{ message?: string }>) => { if (error.response?.status === 401) { useAuthStore().clearSession(); if (router.currentRoute.value.path !== '/login') void router.push('/login'); } const message = error.response?.data?.message ?? '请求失败'; return Promise.reject(new Error(message)); });
export const uploadImage = async (file: File): Promise<string> => {
  const form = new FormData();
  form.append('image', file);
  const { data } = await api.post<{ url: string }>('/uploads/image', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  const base = (import.meta.env.VITE_API_BASE_URL ?? '/api').replace(/\/api$/, '');
  return `${base}${data.url}`;
};
