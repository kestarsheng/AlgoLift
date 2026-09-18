// Pinia store for the practice category board.
import { defineStore } from 'pinia';
import { api } from '../api';
import type { Category } from '../types';
interface CategoryResponse { data: Category[] }
export const useCategoryStore = defineStore('category', { state: () => ({ items: [] as Category[], loading: false, error: '' }), actions: { async fetch(): Promise<void> { this.loading = true; this.error = ''; try { const response = await api.get<CategoryResponse>('/categories'); this.items = response.data.data; } catch (error: unknown) { this.error = error instanceof Error ? error.message : '分类加载失败'; } finally { this.loading = false; } } } });
