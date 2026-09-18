// Axios client with the shared API error normalization.
import axios from 'axios';
export const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api' });
api.interceptors.request.use((config) => { const token = localStorage.getItem('algolift_token'); if (token) config.headers.Authorization = `Bearer ${token}`; return config; });
api.interceptors.response.use((response) => response, (error) => { const message = error.response?.data?.message ?? '请求失败'; return Promise.reject(new Error(message)); });
