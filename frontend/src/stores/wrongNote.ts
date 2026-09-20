// Pinia store for replacing, listing, and removing wrong-note links, plus the note options pool.
import { defineStore } from 'pinia';
import { api } from '../api';
import type { Note } from '../types';
export const useWrongNoteStore = defineStore('wrongNote', { state: () => ({ notes: [] as Note[], allNotes: [] as Note[], loading: false, error: '' }), actions: {
  async fetch(wrongId: string): Promise<Note[]> { this.loading = true; this.error = ''; try { const { data } = await api.get(`/wrongs/${wrongId}/notes`); this.notes = data.data.notes; return this.notes; } catch (error) { this.error = error instanceof Error ? error.message : '请求失败'; throw error; } finally { this.loading = false; } },
  async fetchNotes(): Promise<void> { const { data } = await api.get('/notes', { params: { page: 1, pageSize: 100 } }); this.allNotes = data.data; },
  async replace(wrongId: string, noteIds: string[]): Promise<Note[]> { const { data } = await api.put(`/wrongs/${wrongId}/notes`, { noteIds }); this.notes = data.data.notes; return this.notes; },
  async remove(wrongId: string, noteId: string): Promise<void> { await api.delete(`/wrongs/${wrongId}/notes/${noteId}`); this.notes = this.notes.filter((note) => note.id !== noteId); }
} });
