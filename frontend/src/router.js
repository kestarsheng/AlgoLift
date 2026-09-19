// Lazy-loaded routes for the application shell, list, and detail flows.
import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from './stores/auth';
export const router = createRouter({ history: createWebHistory(), routes: [
        { path: '/', redirect: '/dashboard' },
        { path: '/login', component: () => import('./views/Login.vue'), meta: { public: true } },
        { path: '/register', component: () => import('./views/Register.vue'), meta: { public: true } },
        { path: '/dashboard', component: () => import('./views/Dashboard.vue'), meta: { title: '数据概览' } },
        { path: '/categories', component: () => import('./views/CategoryBoard.vue'), meta: { title: '刷题练习' } },
        { path: '/categories/:categoryId/problems', component: () => import('./views/ProblemList.vue'), meta: { title: '题目列表' } },
        { path: '/problems/:problemId', component: () => import('./views/ProblemDetail.vue'), meta: { title: '题目详情' } },
        { path: '/wrongs', component: () => import('./views/WrongList.vue'), meta: { title: '错题本' } },
        { path: '/wrongs/:wrongId', component: () => import('./views/WrongDetail.vue'), meta: { title: '错题详情' } },
        { path: '/notes', component: () => import('./views/NoteList.vue'), meta: { title: '题解笔记' } },
        { path: '/notes/:noteId', component: () => import('./views/NoteDetail.vue'), meta: { title: '笔记详情' } },
        { path: '/todos', component: () => import('./views/TodoList.vue'), meta: { title: '待办' } },
        { path: '/progress', component: () => import('./views/ProgressList.vue'), meta: { title: '学习进度' } },
    ] });
router.beforeEach(async (to) => { const auth = useAuthStore(); if (auth.token && !auth.user)
    await auth.fetchCurrentUser(); if (to.meta.public && auth.isAuthenticated)
    return '/categories'; if (!to.meta.public && !auth.isAuthenticated)
    return { path: '/login', query: { redirect: to.fullPath } }; });
