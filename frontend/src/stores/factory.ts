import { api } from '../api';
import type { Page, Pagination } from '../types';

export const errorMessage = (error: unknown, fallback: string): string =>
  error instanceof Error ? error.message : fallback;

export interface PagedCrudState<TItem> {
  items: TItem[];
  pagination: Pagination;
  keyword: string;
  loading: boolean;
  saving: boolean;
  saveError: string;
  error?: string;
  listError?: string;
  deleting?: boolean;
  deleteError?: string;
  fetch(): Promise<void>;
}

interface PagedCrudStoreConfig<TItem, TState extends PagedCrudState<TItem> = PagedCrudState<TItem>> {
  endpoint: string;
  errorMessages: { fetch: string; delete?: string };
  listErrorField?: 'error' | 'listError';
  withDelete?: boolean;
  guardConcurrency?: boolean;
  buildParams?: (state: TState) => Record<string, unknown>;
}

export function createPagedCrudStore<TItem, TState extends PagedCrudState<TItem> = PagedCrudState<TItem>>(config: PagedCrudStoreConfig<TItem, TState>) {
  const errorField = config.listErrorField ?? 'error';
  const withDelete = config.withDelete ?? false;
  const guardConcurrency = config.guardConcurrency ?? false;

  return {
    actions: {
      async fetch(this: TState): Promise<void> {
        this.loading = true;
        this[errorField] = '';
        try {
          const params = config.buildParams
            ? config.buildParams(this)
            : { page: this.pagination.page, pageSize: this.pagination.pageSize, keyword: this.keyword || undefined };
          const response = await api.get<Page<TItem>>(config.endpoint, { params });
          this.items = response.data.data;
          this.pagination = response.data.pagination;
        } catch (error: unknown) {
          this[errorField] = errorMessage(error, config.errorMessages.fetch);
        } finally {
          this.loading = false;
        }
      },
      async search(this: TState): Promise<void> {
        this.pagination.page = 1;
        await this.fetch();
      },
      async setPage(this: TState, page: number): Promise<void> {
        this.pagination.page = page;
        await this.fetch();
      },
      ...(withDelete ? {
        async remove(this: TState, id: string): Promise<boolean> {
          if (guardConcurrency && this.deleting) return false;
          this.deleting = true;
          this.deleteError = '';
          try {
            await api.delete(`${config.endpoint}/${id}`);
            if (this.items.length === 1 && this.pagination.page > 1) this.pagination.page -= 1;
            await this.fetch();
            return true;
          } catch (error: unknown) {
            this.deleteError = errorMessage(error, config.errorMessages.delete!);
            return false;
          } finally {
            this.deleting = false;
          }
        },
      } : {}),
    },
  };
}
