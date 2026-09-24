// 覆盖数据概览统计接口的鉴权、难度分布与按日练习计数。
import request from 'supertest';
import { app } from '../src/app';
import { prisma } from '../src/config/prisma';

const prefix = 'stats-test-';
const payload = { email: 'stats-test-user@example.com', password: 'strong-password' };
let token = '';
let problemId = '';

beforeEach(async () => {
  await prisma.user.deleteMany({ where: { email: { startsWith: prefix } } });
  const register = await request(app).post('/api/auth/register').send(payload);
  token = register.body.token;
  const auth = { Authorization: `Bearer ${token}` };
  const easy = await request(app).post('/api/problems').set(auth).send({ title: '两数之和', difficulty: 'EASY' });
  problemId = easy.body.data.id;
  await request(app).post('/api/problems').set(auth).send({ title: '最长回文子串', difficulty: 'MEDIUM' });
  const today = new Date().toISOString().slice(0, 10);
  await request(app).post(`/api/problems/${problemId}/practice-records`).set(auth).send({ practicedAt: today, solvedFirstTry: true });
  await request(app).post(`/api/problems/${problemId}/practice-records`).set(auth).send({ practicedAt: today, solvedFirstTry: false });
});

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: { startsWith: prefix } } });
  await prisma.$disconnect();
});

describe('GET /api/stats/dashboard', () => {
  it('requires authentication', async () => {
    const response = await request(app).get('/api/stats/dashboard');
    expect(response.status).toBe(401);
  });

  it('aggregates difficulty counts and daily practice counts', async () => {
    const response = await request(app).get('/api/stats/dashboard').set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body.difficultyCounts).toEqual({ EASY: 1, MEDIUM: 1, HARD: 0 });
    const today = new Date().toISOString().slice(0, 10);
    expect(response.body.dailyPractice).toEqual([{ date: today, count: 2 }]);
    expect(response.body.totalProblems).toBe(2);
    expect(response.body.completedProblems).toBe(1);
    expect(response.body.accuracy).toBe(50);
  });

  it('caps the days window parameter to the allowed range', async () => {
    const response = await request(app).get('/api/stats/dashboard?days=99999').set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);
    const today = new Date().toISOString().slice(0, 10);
    expect(response.body.dailyPractice).toEqual([{ date: today, count: 2 }]);
  });
});
