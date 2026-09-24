// Pinia store for the practice category board and category management.
import { defineStore } from 'pinia';
import { api } from '../api';
import type { Category } from '../types';
interface CategoryResponse { data: Category[] }
interface CategoryDataResponse { data: Category }
export const useCategoryStore = defineStore('category', { state: () => ({ items: [] as Category[], loading: false, error: '', saving: false, deleting: false, saveError: '', deleteError: '', includeEmpty: false }), actions: {
  message(error: unknown, fallback: string): string { return error instanceof Error ? error.message : fallback; },
  /** 拉取分类列表；`includeEmpty` 为 true 时保留没有题目的分类（看板需要展示空分类）。 */
  async fetch(includeEmpty?: boolean): Promise<void> { this.includeEmpty = includeEmpty ?? this.includeEmpty; this.loading = true; this.error = ''; try { const response = await api.get<CategoryResponse>('/categories', { params: this.includeEmpty ? { includeEmpty: true } : undefined }); this.items = response.data.data; } catch (error: unknown) { this.error = this.message(error, '分类加载失败'); } finally { this.loading = false; } },
  /** 新建分类；成功后按当前 includeEmpty 策略刷新列表，失败返回 null 并写入 saveError。 */
  async create(name: string): Promise<Category | null> { this.saving = true; this.saveError = ''; try { const response = await api.post<CategoryDataResponse>('/categories', { name }); await this.fetch(); return response.data.data; } catch (error: unknown) { this.saveError = this.message(error, '分类保存失败'); return null; } finally { this.saving = false; } },
  /** 重命名分类；参数与返回值语义同 create。 */
  async rename(id: string, name: string): Promise<Category | null> { this.saving = true; this.saveError = ''; try { const response = await api.patch<CategoryDataResponse>(`/categories/${id}`, { name }); await this.fetch(); return response.data.data; } catch (error: unknown) { this.saveError = this.message(error, '分类保存失败'); return null; } finally { this.saving = false; } },
  /** 删除分类；失败返回 false 并写入 deleteError，由调用方提示。 */
  async remove(id: string): Promise<boolean> { this.deleting = true; this.deleteError = ''; try { await api.delete(`/categories/${id}`); await this.fetch(); return true; } catch (error: unknown) { this.deleteError = this.message(error, '分类删除失败'); return false; } finally { this.deleting = false; } }
} });
