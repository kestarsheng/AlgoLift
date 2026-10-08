// 覆盖全局搜索接口的分组返回与用户隔离场景。
import request from 'supertest';
import { app } from '../src/app';
import { prisma } from '../src/config/prisma';

const password = 'strong-password';
let sequence = 0;
const createUser = async (prefix: string): Promise<{ id: string; token: string }> => {
  sequence += 1;
  const email = `${prefix}${Date.now()}-${sequence}@example.com`;
  const response = await request(app).post('/api/auth/register').send({ email, password });
  return { id: response.body.user.id as string, token: response.body.token as string };
};

beforeEach(async () => { await prisma.user.deleteMany({ where: { email: { startsWith: 'search-test-' } } }); });
afterAll(async () => { await prisma.user.deleteMany({ where: { email: { startsWith: 'search-test-' } } }); await prisma.$disconnect(); });

describe('search integration', () => {
  it('returns grouped results matching keyword across types', async () => {
    const user = await createUser('search-test-');
    await prisma.problem.create({ data: { userId: user.id, title: '二分查找', difficulty: 'EASY' } });
    await prisma.wrong.create({ data: { userId: user.id, title: '二分边界错题', difficulty: 'MEDIUM' } });
    await prisma.note.create({ data: { userId: user.id, title: '二分笔记' } });
    await prisma.todo.create({ data: { userId: user.id, title: '复习二分', priority: 'P0', status: 'TODO' } });
    await prisma.problem.create({ data: { userId: user.id, title: '动态规划', difficulty: 'HARD' } });
    const response = await request(app).get('/api/search').set('Authorization', `Bearer ${user.token}`).query({ q: '二分' });
    expect(response.status).toBe(200);
    expect(response.body.data.problems).toHaveLength(1);
    expect(response.body.data.problems[0].title).toBe('二分查找');
    expect(response.body.data.wrongs).toHaveLength(1);
    expect(response.body.data.notes).toHaveLength(1);
    expect(response.body.data.todos).toHaveLength(1);
  });

  it('returns empty results for blank keyword', async () => {
    const user = await createUser('search-test-blank-');
    const response = await request(app).get('/api/search').set('Authorization', `Bearer ${user.token}`).query({ q: '' });
    expect(response.status).toBe(200);
    expect(response.body.data.problems).toEqual([]);
    expect(response.body.data.wrongs).toEqual([]);
  });

  it('hides another user resources', async () => {
    const owner = await createUser('search-test-owner-');
    const other = await createUser('search-test-other-');
    await prisma.problem.create({ data: { userId: owner.id, title: '私有题目', difficulty: 'EASY' } });
    await prisma.problem.create({ data: { userId: other.id, title: '他人题目', difficulty: 'EASY' } });
    const response = await request(app).get('/api/search').set('Authorization', `Bearer ${owner.token}`).query({ q: '题目' });
    expect(response.body.data.problems).toHaveLength(1);
    expect(response.body.data.problems[0].title).toBe('私有题目');
  });
});