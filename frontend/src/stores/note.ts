// Pinia store for note details and their linked wrongs, plus note edit and delete.
import { defineStore } from 'pinia';
import { api } from '../api';
import type { Note, Wrong } from '../types';
export const useNoteStore = defineStore('note', { state: () => ({ note: null as Note | null, wrongs: [] as Wrong[], loading: false, saving: false, deleting: false, saveError: '', deleteError: '' }), actions: {
  message(error: unknown, fallback: string): string { return error instanceof Error ? error.message : fallback; },
  async fetch(noteId: string): Promise<void> { this.loading = true; try { const detail = await api.get(`/notes/${noteId}`); this.note = detail.data.data; const { data } = await api.get('/wrongs', { params: { page: 1, pageSize: 100 } }); const wrongs = data.data as Wrong[]; const linked = await Promise.all(wrongs.map(async (wrong) => { const links = await api.get(`/wrongs/${wrong.id}/notes`); return links.data.data.notes.some((note: Note) => note.id === noteId) ? wrong : null; })); this.wrongs = linked.filter((wrong): wrong is Wrong => wrong !== null); } finally { this.loading = false; } },
  async update(noteId: string, input: { title: string; content: string }): Promise<boolean> { this.saving = true; this.saveError = ''; try { await api.patch(`/notes/${noteId}`, { title: input.title.trim(), content: input.content }); await this.fetch(noteId); return true; } catch (error: unknown) { this.saveError = this.message(error, '笔记保存失败'); return false; } finally { this.saving = false; } },
  async remove(noteId: string): Promise<boolean> { this.deleting = true; this.deleteError = ''; try { await api.delete(`/notes/${noteId}`); this.note = null; return true; } catch (error: unknown) { this.deleteError = this.message(error, '笔记删除失败'); return false; } finally { this.deleting = false; } }
} });
