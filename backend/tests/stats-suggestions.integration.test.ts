// 覆盖学习建议接口基于真实数据生成建议的场景。
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

beforeEach(async () => { await prisma.user.deleteMany({ where: { email: { startsWith: 'suggestions-test-' } } }); });
afterAll(async () => { await prisma.user.deleteMany({ where: { email: { startsWith: 'suggestions-test-' } } }); await prisma.$disconnect(); });

describe('stats suggestions integration', () => {
  it('suggests reviewing top wrong category', async () => {
    const user = await createUser('suggestions-test-wrong-');
    await prisma.wrong.create({ data: { userId: user.id, title: '错题一', category: '动态规划', difficulty: 'HARD' } });
    await prisma.wrong.create({ data: { userId: user.id, title: '错题二', category: '动态规划', difficulty: 'MEDIUM' } });
    await prisma.wrong.create({ data: { userId: user.id, title: '错题三', category: '贪心', difficulty: 'EASY' } });
    const response = await request(app).get('/api/stats/suggestions').set('Authorization', `Bearer ${user.token}`);
    expect(response.status).toBe(200);
    const reviewSuggestion = response.body.suggestions.find((s: { type: string }) => s.type === 'review_wrong');
    expect(reviewSuggestion).toBeDefined();
    expect(reviewSuggestion.title).toContain('动态规划');
  });

  it('suggests retrying low accuracy problem', async () => {
    const user = await createUser('suggestions-test-low-acc-');
    const problem = await prisma.problem.create({ data: { userId: user.id, title: '低正确率题', difficulty: 'MEDIUM' } });
    await prisma.practiceRecord.create({ data: { userId: user.id, problemId: problem.id, practicedAt: new Date('2026-09-01'), solvedFirstTry: false } });
    await prisma.practiceRecord.create({ data: { userId: user.id, problemId: problem.id, practicedAt: new Date('2026-09-02'), solvedFirstTry: false } });
    const response = await request(app).get('/api/stats/suggestions').set('Authorization', `Bearer ${user.token}`);
    const retrySuggestion = response.body.suggestions.find((s: { type: string }) => s.type === 'retry_low_accuracy');
    expect(retrySuggestion).toBeDefined();
    expect(retrySuggestion.title).toContain('低正确率题');
  });

  it('suggests practicing unsolved problem', async () => {
    const user = await createUser('suggestions-test-unsolved-');
    await prisma.problem.create({ data: { userId: user.id, title: '未做过', difficulty: 'EASY' } });
    const response = await request(app).get('/api/stats/suggestions').set('Authorization', `Bearer ${user.token}`);
    const practiceSuggestion = response.body.suggestions.find((s: { type: string }) => s.type === 'practice_unsolved');
    expect(practiceSuggestion).toBeDefined();
    expect(practiceSuggestion.title).toContain('未做过');
  });

  it('suggests completing pending todo', async () => {
    const user = await createUser('suggestions-test-todo-');
    await prisma.todo.create({ data: { userId: user.id, title: '紧急待办', priority: 'P0', status: 'TODO', dueDate: new Date('2026-10-01') } });
    const response = await request(app).get('/api/stats/suggestions').set('Authorization', `Bearer ${user.token}`);
    const todoSuggestion = response.body.suggestions.find((s: { type: string }) => s.type === 'complete_todo');
    expect(todoSuggestion).toBeDefined();
    expect(todoSuggestion.title).toContain('紧急待办');
  });

  it('returns default suggestion when no data', async () => {
    const user = await createUser('suggestions-test-empty-');
    const response = await request(app).get('/api/stats/suggestions').set('Authorization', `Bearer ${user.token}`);
    expect(response.status).toBe(200);
    expect(response.body.suggestions).toHaveLength(1);
    expect(response.body.suggestions[0].type).toBe('keep_going');
  });
});