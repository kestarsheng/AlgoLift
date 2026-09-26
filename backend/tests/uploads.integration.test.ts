// 覆盖图片上传 API 的成功、类型校验、大小限制和鉴权场景。
import request from 'supertest';
import { app } from '../src/app';
import { prisma } from '../src/config/prisma';

const testEmailPrefix = 'uploads-test-';
const pngBuffer = Buffer.from('89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000a49444154789c63000100000500010d0a2db40000000049454e44ae426082', 'hex');

const createUser = async (): Promise<string> => {
  const email = `uploads-test-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
  const res = await request(app).post('/api/auth/register').send({ email, password: 'strong-password' });
  return res.body.token as string;
};

beforeEach(async () => {
  await prisma.user.deleteMany({ where: { email: { startsWith: testEmailPrefix } } });
});

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: { startsWith: testEmailPrefix } } });
  await prisma.$disconnect();
});

describe('POST /api/uploads/image', () => {
  it('uploads a valid image successfully', async () => {
    const token = await createUser();
    const res = await request(app).post('/api/uploads/image').set('Authorization', `Bearer ${token}`).attach('image', pngBuffer, 'test.png');
    expect(res.status).toBe(201);
    expect(res.body.url).toMatch(/^\/uploads\//);
  });

  it('rejects an unsupported file type', async () => {
    const token = await createUser();
    const res = await request(app).post('/api/uploads/image').set('Authorization', `Bearer ${token}`).attach('image', Buffer.from('hello'), 'test.txt');
    expect(res.status).toBe(400);
  });

  it('rejects a request without authentication', async () => {
    const res = await request(app).post('/api/uploads/image').attach('image', pngBuffer, 'test.png');
    expect(res.status).toBe(401);
  });

  it('rejects a file exceeding 10MB', async () => {
    const token = await createUser();
    const large = Buffer.alloc(10 * 1024 * 1024 + 1);
    const res = await request(app).post('/api/uploads/image').set('Authorization', `Bearer ${token}`).attach('image', large, 'large.png');
    expect(res.status).toBe(400);
  });
});