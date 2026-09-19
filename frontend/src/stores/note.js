// Pinia store for note details and their linked wrongs.
import { defineStore } from 'pinia';
import { api } from '../api';
export const useNoteStore = defineStore('note', { state: () => ({ note: null, wrongs: [], loading: false }), actions: {
        async fetch(noteId) { this.loading = true; try {
            const detail = await api.get(`/notes/${noteId}`);
            this.note = detail.data.data;
            const { data } = await api.get('/wrongs', { params: { page: 1, pageSize: 100 } });
            const wrongs = data.data;
            const linked = await Promise.all(wrongs.map(async (wrong) => { const links = await api.get(`/wrongs/${wrong.id}/notes`); return links.data.data.notes.some((note) => note.id === noteId) ? wrong : null; }));
            this.wrongs = linked.filter((wrong) => wrong !== null);
        }
        finally {
            this.loading = false;
        } }
    } });
