// Lazy-loaded routes for the application shell, list, and detail flows.
import { createRouter, createWebHistory } from 'vue-router';
export const router = createRouter({ history: createWebHistory(), routes: [
  { path: '/', redirect: '/categories' },
  { path: '/categories', component: () => import('./views/CategoryBoard.vue'), meta: { title: '刷题练习' } },
  { path: '/categories/:categoryId/problems', component: () => import('./views/ProblemList.vue'), meta: { title: '题目列表' } },
  { path: '/problems/:problemId', component: () => import('./views/ProblemDetail.vue'), meta: { title: '题目详情' } },
  { path: '/wrongs', component: () => import('./views/WrongList.vue'), meta: { title: '错题本' } },
  { path: '/wrongs/:wrongId', component: () => import('./views/WrongDetail.vue'), meta: { title: '错题详情' } },
  { path: '/notes', component: () => import('./views/NoteList.vue'), meta: { title: '题解笔记' } },
  { path: '/notes/:noteId', component: () => import('./views/NoteDetail.vue'), meta: { title: '笔记详情' } },
] });
