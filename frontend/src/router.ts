// Lazy-loaded routes for the application shell, list, and detail flows.
import { createRouter, createWebHistory } from 'vue-router';
export const router = createRouter({ history: createWebHistory(), routes: [
  { path: '/', redirect: '/wrongs' },
  { path: '/wrongs', component: () => import('./views/WrongList.vue'), meta: { title: '错题本' } },
  { path: '/wrongs/:wrongId', component: () => import('./views/WrongDetail.vue'), meta: { title: '错题详情' } },
  { path: '/notes', component: () => import('./views/NoteList.vue'), meta: { title: '题解笔记' } },
  { path: '/notes/:noteId', component: () => import('./views/NoteDetail.vue'), meta: { title: '笔记详情' } },
] });
