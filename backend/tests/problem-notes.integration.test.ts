// 覆盖题目关联笔记接口的数据库集成场景。
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

beforeEach(async () => {
  await prisma.user.deleteMany({ where: { email: { startsWith: 'problem-notes-test-' } } });
});

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: { startsWith: 'problem-notes-test-' } } });
  await prisma.$disconnect();
});

describe('problem notes integration', () => {
  it('replaces linked notes transactionally and supports clearing', async () => {
    const user = await createUser('problem-notes-test-');
    const problem = await prisma.problem.create({ data: { userId: user.id, title: 'Two Sum', difficulty: 'EASY' } });
    const first = await prisma.note.create({ data: { userId: user.id, title: '哈希表笔记' } });
    const second = await prisma.note.create({ data: { userId: user.id, title: '数组笔记' } });
    const response = await request(app).put(`/api/problems/${problem.id}/notes`).set('Authorization', `Bearer ${user.token}`).send({ noteIds: [first.id, second.id] });
    expect(response.status).toBe(200);
    expect(response.body.data.notes.map((note: { id: string }) => note.id)).toEqual(expect.arrayContaining([first.id, second.id]));
    expect(response.body.data.notes).toHaveLength(2);
    expect(await prisma.problemNote.count({ where: { problemId: problem.id } })).toBe(2);
    const clear = await request(app).put(`/api/problems/${problem.id}/notes`).set('Authorization', `Bearer ${user.token}`).send({ noteIds: [] });
    expect(clear.status).toBe(200);
    expect(clear.body.data.notes).toEqual([]);
  });

  it('rejects another user note without changing existing links', async () => {
    const owner = await createUser('problem-notes-test-owner-');
    const other = await createUser('problem-notes-test-other-');
    const problem = await prisma.problem.create({ data: { userId: owner.id, title: '反转链表', difficulty: 'MEDIUM' } });
    const ownNote = await prisma.note.create({ data: { userId: owner.id, title: '已有笔记' } });
    const foreignNote = await prisma.note.create({ data: { userId: other.id, title: '他人笔记' } });
    await prisma.problemNote.create({ data: { problemId: problem.id, noteId: ownNote.id } });
    const response = await request(app).put(`/api/problems/${problem.id}/notes`).set('Authorization', `Bearer ${owner.token}`).send({ noteIds: [foreignNote.id] });
    expect(response.status).toBe(403);
    expect(response.body.code).toBe('NOTE_ACCESS_DENIED');
    expect(await prisma.problemNote.findMany({ where: { problemId: problem.id } })).toHaveLength(1);
  });

  it('returns 404 for another user problem and 400 for duplicate note IDs', async () => {
    const owner = await createUser('problem-notes-test-owner-');
    const other = await createUser('problem-notes-test-other-');
    const problem = await prisma.problem.create({ data: { userId: owner.id, title: '二叉树遍历', difficulty: 'HARD' } });
    const note = await prisma.note.create({ data: { userId: owner.id, title: '遍历笔记' } });
    const forbidden = await request(app).put(`/api/problems/${problem.id}/notes`).set('Authorization', `Bearer ${other.token}`).send({ noteIds: [note.id] });
    expect(forbidden.status).toBe(404);
    expect(forbidden.body.code).toBe('PROBLEM_NOT_FOUND');
    const invalid = await request(app).put(`/api/problems/${problem.id}/notes`).set('Authorization', `Bearer ${owner.token}`).send({ noteIds: [note.id, note.id] });
    expect(invalid.status).toBe(400);
    expect(invalid.body.code).toBe('INVALID_NOTE_IDS');
  });
});
