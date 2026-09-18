// Lazy-loaded routes for the wrong and note detail flows.
import { createRouter, createWebHistory } from 'vue-router';
export const router = createRouter({ history: createWebHistory(), routes: [{ path: '/wrongs/:wrongId', component: () => import('./views/WrongDetail.vue') }, { path: '/notes/:noteId', component: () => import('./views/NoteDetail.vue') }] });
