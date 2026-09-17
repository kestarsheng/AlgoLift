// 覆盖题目 CRUD 接口的数据库集成场景。
import request from 'supertest';
import { app } from '../src/app';
import { prisma } from '../src/config/prisma';
const password = 'strong-password'; let sequence = 0;
const createUser = async (prefix: string): Promise<{ id: string; token: string }> => { sequence += 1; const email = `${prefix}${Date.now()}-${sequence}@example.com`; const response = await request(app).post('/api/auth/register').send({ email, password }); return { id: response.body.user.id as string, token: response.body.token as string }; };
beforeEach(async () => { await prisma.user.deleteMany({ where: { email: { startsWith: 'problem-test-' } } }); });
afterAll(async () => { await prisma.user.deleteMany({ where: { email: { startsWith: 'problem-test-' } } }); await prisma.$disconnect(); });
describe('problem integration', () => {
  it('creates and gets a problem with categories', async () => {
    const user = await createUser('problem-test-');
    const category = await prisma.category.create({ data: { userId: user.id, name: '数组' } });
    const created = await request(app).post('/api/problems').set('Authorization', `Bearer ${user.token}`).send({ title: 'Two Sum', difficulty: 'EASY', internalNote: '<script>x()</script><p onclick="bad()">哈希表</p>', categoryIds: [category.id] });
    expect(created.status).toBe(201); expect(created.body.data).toMatchObject({ title: 'Two Sum', difficulty: 'EASY', internalNote: '<p>哈希表</p>', practiceCount: 0, noteCount: 0 });
    const detail = await request(app).get(`/api/problems/${created.body.data.id}`).set('Authorization', `Bearer ${user.token}`);
    expect(detail.status).toBe(200); expect(detail.body.data.categories).toEqual([{ id: category.id, name: '数组' }]);
  });
  it('lists with filters and updates a problem', async () => {
    const user = await createUser('problem-test-');
    const category = await prisma.category.create({ data: { userId: user.id, name: '动态规划' } });
    await prisma.problem.create({ data: { userId: user.id, title: '爬楼梯', difficulty: 'MEDIUM', categories: { create: { categoryId: category.id } } } });
    await prisma.problem.create({ data: { userId: user.id, title: 'Two Sum', difficulty: 'EASY' } });
    const list = await request(app).get('/api/problems?keyword=楼&categoryId=' + category.id).set('Authorization', `Bearer ${user.token}`);
    expect(list.status).toBe(200); expect(list.body.pagination.total).toBe(1); expect(list.body.data[0].title).toBe('爬楼梯');
    const problemId = list.body.data[0].id as string;
    const updated = await request(app).patch(`/api/problems/${problemId}`).set('Authorization', `Bearer ${user.token}`).send({ title: '爬楼梯进阶', difficulty: 'HARD' });
    expect(updated.status).toBe(200); expect(updated.body.data).toMatchObject({ title: '爬楼梯进阶', difficulty: 'HARD' });
  });
  it('enforces duplicate titles and user isolation', async () => {
    const owner = await createUser('problem-test-owner-'); const other = await createUser('problem-test-other-');
    const problem = await prisma.problem.create({ data: { userId: owner.id, title: '反转链表', difficulty: 'MEDIUM' } });
    const duplicate = await request(app).post('/api/problems').set('Authorization', `Bearer ${owner.token}`).send({ title: '反转链表', difficulty: 'EASY' });
    expect(duplicate.status).toBe(409); expect(duplicate.body.code).toBe('PROBLEM_TITLE_EXISTS');
    const forbidden = await request(app).get(`/api/problems/${problem.id}`).set('Authorization', `Bearer ${other.token}`);
    expect(forbidden.status).toBe(404); expect(forbidden.body.code).toBe('PROBLEM_NOT_FOUND');
  });
  it('deletes a problem and cascades relations', async () => {
    const user = await createUser('problem-test-'); const problem = await prisma.problem.create({ data: { userId: user.id, title: '待删除', difficulty: 'HARD' } });
    const note = await prisma.note.create({ data: { userId: user.id, title: '关联笔记' } });
    await prisma.problemNote.create({ data: { problemId: problem.id, noteId: note.id } });
    await prisma.practiceRecord.create({ data: { userId: user.id, problemId: problem.id, practicedAt: new Date('2026-09-17'), solvedFirstTry: false } });
    const response = await request(app).delete(`/api/problems/${problem.id}`).set('Authorization', `Bearer ${user.token}`);
    expect(response.status).toBe(204); expect(await prisma.problem.findUnique({ where: { id: problem.id } })).toBeNull(); expect(await prisma.problemNote.count({ where: { problemId: problem.id } })).toBe(0); expect(await prisma.practiceRecord.count({ where: { problemId: problem.id } })).toBe(0);
  });
});
