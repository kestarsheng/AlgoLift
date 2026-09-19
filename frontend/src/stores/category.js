// Pinia store for the practice category board.
import { defineStore } from 'pinia';
import { api } from '../api';
export const useCategoryStore = defineStore('category', { state: () => ({ items: [], loading: false, error: '' }), actions: { async fetch(includeEmpty = false) { this.loading = true; this.error = ''; try {
            const response = await api.get('/categories', { params: includeEmpty ? { includeEmpty: true } : undefined });
            this.items = response.data.data;
        }
        catch (error) {
            this.error = error instanceof Error ? error.message : '分类加载失败';
        }
        finally {
            this.loading = false;
        } } } });
