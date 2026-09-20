// 验证错题 CRUD、输入校验、题目归属与用户数据隔离。
import request from 'supertest';
import { app } from '../src/app';
import { prisma } from '../src/config/prisma';
let sequence = 0;
const user = async (prefix: string): Promise<{ id: string; token: string }> => { sequence += 1; const response = await request(app).post('/api/auth/register').send({ email: `${prefix}${Date.now()}-${sequence}@example.com`, password: 'strong-password' }); return { id: response.body.user.id, token: response.body.token }; };
afterAll(async () => prisma.$disconnect());

describe('wrong CRUD', () => {
  it('creates, lists, gets, updates and deletes a wrong', async () => {
    const account = await user('wrong-crud-');
    const problem = await prisma.problem.create({ data: { userId: account.id, title: '三数之和', difficulty: 'MEDIUM' } });
    const created = await request(app).post('/api/wrongs').set('Authorization', `Bearer ${account.token}`).send({ problemId: problem.id, title: ' 三数之和去重 ', category: '双指针', difficulty: 'MEDIUM', review: '<p onclick="bad()">复盘</p>', solutionLinks: [{ name: '题解', url: 'https://example.com' }] });
    expect(created.status).toBe(201); expect(created.body.data.title).toBe('三数之和去重'); expect(created.body.data.review).toBe('<p>复盘</p>');
    const id = created.body.data.id;
    const note = await prisma.note.create({ data: { userId: account.id, title: '双指针题解' } });
    await prisma.wrongNote.create({ data: { wrongId: id, noteId: note.id } });
    const listed = await request(app).get('/api/wrongs?category=双指针').set('Authorization', `Bearer ${account.token}`);
    expect(listed.body.data).toHaveLength(1); expect(listed.body.data[0].noteCount).toBe(1);
    expect((await request(app).get(`/api/wrongs/${id}`).set('Authorization', `Bearer ${account.token}`)).body.data.problemId).toBe(problem.id);
    expect((await request(app).patch(`/api/wrongs/${id}`).set('Authorization', `Bearer ${account.token}`).send({ difficulty: 'HARD', review: null })).body.data.difficulty).toBe('HARD');
    expect((await request(app).delete(`/api/wrongs/${id}`).set('Authorization', `Bearer ${account.token}`)).status).toBe(204);
  });
  it('rejects invalid payload and hides another user wrong', async () => {
    const owner = await user('wrong-owner-'); const other = await user('wrong-other-');
    expect((await request(app).post('/api/wrongs').set('Authorization', `Bearer ${owner.token}`).send({ title: '', difficulty: 'EASY', solutionLinks: [] })).body.code).toBe('INVALID_WRONG_INPUT');
    const wrong = await prisma.wrong.create({ data: { userId: owner.id, title: '私有错题', difficulty: 'EASY' } });
    expect((await request(app).get(`/api/wrongs/${wrong.id}`).set('Authorization', `Bearer ${other.token}`)).status).toBe(404);
  });
});
