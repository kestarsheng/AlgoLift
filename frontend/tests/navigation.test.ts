import { describe, expect, it } from 'vitest';
import { createMemoryHistory, createRouter } from 'vue-router';
import { router } from '../src/router';
describe('navigation routes', () => { it('supports list and detail routes', async () => { const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/wrongs', component: {} }, { path: '/notes', component: {} }, { path: '/wrongs/:wrongId', component: {} }, { path: '/notes/:noteId', component: {} }] }); await router.push('/notes'); expect(router.currentRoute.value.path).toBe('/notes'); await router.push('/wrongs/w1'); expect(router.currentRoute.value.path).toBe('/wrongs/w1'); }); });
it('keeps the problem detail route lazy and highlighted', () => { const route = router.getRoutes().find((item) => item.path === '/problems/:problemId'); expect(route?.meta.title).toBe('题目详情'); expect(typeof route?.components?.default).toBe('function'); });
