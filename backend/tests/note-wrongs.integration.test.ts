// 覆盖笔记关联错题聚合接口的查询与隔离场景。
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

beforeEach(async () => { await prisma.user.deleteMany({ where: { email: { startsWith: 'note-wrongs-test-' } } }); });
afterAll(async () => { await prisma.user.deleteMany({ where: { email: { startsWith: 'note-wrongs-test-' } } }); await prisma.$disconnect(); });

describe('note wrongs aggregation integration', () => {
  it('returns wrongs linked to the note in a single request', async () => {
    const user = await createUser('note-wrongs-test-');
    const note = await prisma.note.create({ data: { userId: user.id, title: '聚合笔记' } });
    const first = await prisma.wrong.create({ data: { userId: user.id, title: '错题一', difficulty: 'EASY' } });
    const second = await prisma.wrong.create({ data: { userId: user.id, title: '错题二', difficulty: 'MEDIUM' } });
    const unrelated = await prisma.wrong.create({ data: { userId: user.id, title: '无关错题', difficulty: 'HARD' } });
    await prisma.wrongNote.create({ data: { wrongId: first.id, noteId: note.id } });
    await prisma.wrongNote.create({ data: { wrongId: second.id, noteId: note.id } });
    const response = await request(app).get(`/api/notes/${note.id}/wrongs`).set('Authorization', `Bearer ${user.token}`);
    expect(response.status).toBe(200);
    expect(response.body.data.noteId).toBe(note.id);
    const titles = response.body.data.wrongs.map((w: { title: string }) => w.title);
    expect(titles).toContain('错题一');
    expect(titles).toContain('错题二');
    expect(titles).not.toContain(unrelated.title);
  });

  it('returns 404 when the note does not exist', async () => {
    const user = await createUser('note-wrongs-test-missing-');
    const response = await request(app).get('/api/notes/00000000-0000-0000-0000-000000000000/wrongs').set('Authorization', `Bearer ${user.token}`);
    expect(response.status).toBe(404);
    expect(response.body.code).toBe('NOTE_NOT_FOUND');
  });

  it('hides another user note and wrongs', async () => {
    const owner = await createUser('note-wrongs-test-owner-');
    const other = await createUser('note-wrongs-test-other-');
    const note = await prisma.note.create({ data: { userId: owner.id, title: '私有笔记' } });
    const wrong = await prisma.wrong.create({ data: { userId: owner.id, title: '私有错题', difficulty: 'EASY' } });
    await prisma.wrongNote.create({ data: { wrongId: wrong.id, noteId: note.id } });
    const response = await request(app).get(`/api/notes/${note.id}/wrongs`).set('Authorization', `Bearer ${other.token}`);
    expect(response.status).toBe(404);
    expect(response.body.code).toBe('NOTE_NOT_FOUND');
  });
});