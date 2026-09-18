// Pinia store for note details and their linked wrongs.
import { defineStore } from 'pinia';
import { api } from '../api';
import type { Note, Wrong } from '../types';
export const useNoteStore = defineStore('note', { state: () => ({ note: null as Note | null, wrongs: [] as Wrong[], loading: false }), actions: {
  async fetch(noteId: string): Promise<void> { this.loading = true; try { const detail = await api.get(`/notes/${noteId}`); this.note = detail.data.data; const { data } = await api.get('/wrongs', { params: { page: 1, pageSize: 100 } }); const wrongs = data.data as Wrong[]; const linked = await Promise.all(wrongs.map(async (wrong) => { const links = await api.get(`/wrongs/${wrong.id}/notes`); return links.data.data.notes.some((note: Note) => note.id === noteId) ? wrong : null; })); this.wrongs = linked.filter((wrong): wrong is Wrong => wrong !== null); } finally { this.loading = false; } }
} });
