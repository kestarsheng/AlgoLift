// Pinia store for replacing, listing, and removing wrong-note links.
import { defineStore } from 'pinia';
import { api } from '../api';
export const useWrongNoteStore = defineStore('wrongNote', { state: () => ({ notes: [], loading: false, error: '' }), actions: {
        async fetch(wrongId) { this.loading = true; this.error = ''; try {
            const { data } = await api.get(`/wrongs/${wrongId}/notes`);
            this.notes = data.data.notes;
            return this.notes;
        }
        catch (error) {
            this.error = error instanceof Error ? error.message : '请求失败';
            throw error;
        }
        finally {
            this.loading = false;
        } },
        async replace(wrongId, noteIds) { const { data } = await api.put(`/wrongs/${wrongId}/notes`, { noteIds }); this.notes = data.data.notes; return this.notes; },
        async remove(wrongId, noteId) { await api.delete(`/wrongs/${wrongId}/notes/${noteId}`); this.notes = this.notes.filter((note) => note.id !== noteId); }
    } });
