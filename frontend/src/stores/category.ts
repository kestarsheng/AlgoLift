// Pinia store for the practice category board and category management.
import { defineStore } from 'pinia';
import { api } from '../api';
import type { Category } from '../types';
interface CategoryResponse { data: Category[] }
interface CategoryDataResponse { data: Category }
export const useCategoryStore = defineStore('category', { state: () => ({ items: [] as Category[], loading: false, error: '', saving: false, deleting: false, saveError: '', deleteError: '' }), actions: {
  message(error: unknown, fallback: string): string { return error instanceof Error ? error.message : fallback; },
  async fetch(includeEmpty = false): Promise<void> { this.loading = true; this.error = ''; try { const response = await api.get<CategoryResponse>('/categories', { params: includeEmpty ? { includeEmpty: true } : undefined }); this.items = response.data.data; } catch (error: unknown) { this.error = this.message(error, '分类加载失败'); } finally { this.loading = false; } },
  async create(name: string): Promise<Category | null> { this.saving = true; this.saveError = ''; try { const response = await api.post<CategoryDataResponse>('/categories', { name }); await this.fetch(true); return response.data.data; } catch (error: unknown) { this.saveError = this.message(error, '分类保存失败'); return null; } finally { this.saving = false; } },
  async rename(id: string, name: string): Promise<Category | null> { this.saving = true; this.saveError = ''; try { const response = await api.patch<CategoryDataResponse>(`/categories/${id}`, { name }); await this.fetch(true); return response.data.data; } catch (error: unknown) { this.saveError = this.message(error, '分类保存失败'); return null; } finally { this.saving = false; } },
  async remove(id: string): Promise<boolean> { this.deleting = true; this.deleteError = ''; try { await api.delete(`/categories/${id}`); await this.fetch(true); return true; } catch (error: unknown) { this.deleteError = this.message(error, '分类删除失败'); return false; } finally { this.deleting = false; } }
} });
