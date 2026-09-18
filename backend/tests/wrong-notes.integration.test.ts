// 覆盖错题关联笔记接口的查询、替换、清空和解除场景。
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

beforeEach(async () => { await prisma.user.deleteMany({ where: { email: { startsWith: 'wrong-notes-test-' } } }); });
afterAll(async () => { await prisma.user.deleteMany({ where: { email: { startsWith: 'wrong-notes-test-' } } }); await prisma.$disconnect(); });

describe('wrong notes integration', () => {
  it('queries, replaces, clears and removes one link', async () => {
    const user = await createUser('wrong-notes-test-');
    const wrong = await prisma.wrong.create({ data: { userId: user.id, title: '二分边界', difficulty: 'MEDIUM' } });
    const first = await prisma.note.create({ data: { userId: user.id, title: '二分笔记' } });
    const second = await prisma.note.create({ data: { userId: user.id, title: '边界笔记' } });
    const put = await request(app).put(`/api/wrongs/${wrong.id}/notes`).set('Authorization', `Bearer ${user.token}`).send({ noteIds: [first.id, second.id] });
    expect(put.status).toBe(200);
    expect(put.body.data.notes).toHaveLength(2);
    expect((await request(app).get(`/api/wrongs/${wrong.id}/notes`).set('Authorization', `Bearer ${user.token}`)).body.data.notes).toHaveLength(2);
    expect((await request(app).delete(`/api/wrongs/${wrong.id}/notes/${first.id}`).set('Authorization', `Bearer ${user.token}`)).status).toBe(204);
    expect(await prisma.wrongNote.count({ where: { wrongId: wrong.id } })).toBe(1);
    expect((await request(app).put(`/api/wrongs/${wrong.id}/notes`).set('Authorization', `Bearer ${user.token}`).send({ noteIds: [] })).body.data.notes).toEqual([]);
  });

  it('rejects foreign notes without changing existing links', async () => {
    const owner = await createUser('wrong-notes-test-owner-');
    const other = await createUser('wrong-notes-test-other-');
    const wrong = await prisma.wrong.create({ data: { userId: owner.id, title: '链表指针', difficulty: 'HARD' } });
    const ownNote = await prisma.note.create({ data: { userId: owner.id, title: '已有笔记' } });
    const foreignNote = await prisma.note.create({ data: { userId: other.id, title: '他人笔记' } });
    await prisma.wrongNote.create({ data: { wrongId: wrong.id, noteId: ownNote.id } });
    const response = await request(app).put(`/api/wrongs/${wrong.id}/notes`).set('Authorization', `Bearer ${owner.token}`).send({ noteIds: [foreignNote.id] });
    expect(response.status).toBe(403);
    expect(response.body.code).toBe('NOTE_ACCESS_DENIED');
    expect(await prisma.wrongNote.count({ where: { wrongId: wrong.id } })).toBe(1);
  });

  it('hides another user wrong and validates duplicate IDs', async () => {
    const owner = await createUser('wrong-notes-test-owner-');
    const other = await createUser('wrong-notes-test-other-');
    const wrong = await prisma.wrong.create({ data: { userId: owner.id, title: '树遍历', difficulty: 'EASY' } });
    const note = await prisma.note.create({ data: { userId: owner.id, title: '树笔记' } });
    const forbidden = await request(app).get(`/api/wrongs/${wrong.id}/notes`).set('Authorization', `Bearer ${other.token}`);
    expect(forbidden.status).toBe(404);
    expect(forbidden.body.code).toBe('WRONG_NOT_FOUND');
    const invalid = await request(app).put(`/api/wrongs/${wrong.id}/notes`).set('Authorization', `Bearer ${owner.token}`).send({ noteIds: [note.id, note.id] });
    expect(invalid.status).toBe(400);
    expect(invalid.body.code).toBe('INVALID_NOTE_IDS');
  });
});
