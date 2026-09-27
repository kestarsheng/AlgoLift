// 覆盖认证限流中间件：超出窗口次数返回 429 JSON，未超出正常放行。
import express from 'express';
import request from 'supertest';
import { createRateLimiter } from '../src/middleware/rate-limit.middleware';

const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.post('/auth/login', createRateLimiter({ windowMs: 60_000, limit: 3, skip: () => false }), (_req, res) => {
    res.json({ ok: true });
  });
  return app;
};

describe('rate-limit middleware', () => {
  it('returns 429 with JSON body after limit is exceeded', async () => {
    const app = buildApp();
    for (let i = 0; i < 3; i += 1) {
      const response = await request(app).post('/auth/login').send({ email: 'a@b.com', password: 'x' });
      expect(response.status).toBe(200);
    }
    const blocked = await request(app).post('/auth/login').send({ email: 'a@b.com', password: 'x' });
    expect(blocked.status).toBe(429);
    expect(blocked.body).toEqual({ code: 'RATE_LIMITED', message: '请求过于频繁，请稍后再试' });
  });
});