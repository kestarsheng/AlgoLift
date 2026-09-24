// 覆盖认证 API 的注册、登录和当前用户查询场景。
import request from 'supertest';
import { app } from '../src/app';
import { prisma } from '../src/config/prisma';

const registerPayload = { email: 'auth-test-user@example.com', password: 'strong-password' };
const testEmailPrefix = 'auth-test-';

beforeEach(async () => {
  await prisma.user.deleteMany({ where: { email: { startsWith: testEmailPrefix } } });
});

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: { startsWith: testEmailPrefix } } });
  await prisma.$disconnect();
});

describe('POST /api/auth/register', () => {
  it('registers successfully', async () => {
    const response = await request(app).post('/api/auth/register').send(registerPayload);
    expect(response.status).toBe(201);
    expect(response.body.user.email).toBe(registerPayload.email);
    expect(response.body.user).not.toHaveProperty('passwordHash');
    expect(response.body.token).toEqual(expect.any(String));
  });

  it('registers with a display name', async () => {
    const response = await request(app).post('/api/auth/register').send({ ...registerPayload, email: 'auth-test-display@example.com', displayName: 'Kestar' });
    expect(response.status).toBe(201);
    expect(response.body.user.displayName).toBe('Kestar');
  });

  it('rejects an existing email', async () => {
    await request(app).post('/api/auth/register').send(registerPayload);
    const response = await request(app).post('/api/auth/register').send(registerPayload);
    expect(response.status).toBe(409);
    expect(response.body.code).toBe('EMAIL_ALREADY_EXISTS');
  });

  it('rejects a password shorter than eight characters', async () => {
    const response = await request(app).post('/api/auth/register').send({ ...registerPayload, password: 'short' });
    expect(response.status).toBe(400);
    expect(response.body.code).toBe('VALIDATION_ERROR');
  });

  it('rejects an invalid email format', async () => {
    const response = await request(app).post('/api/auth/register').send({ ...registerPayload, email: 'invalid-email' });
    expect(response.status).toBe(400);
    expect(response.body.code).toBe('VALIDATION_ERROR');
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await request(app).post('/api/auth/register').send(registerPayload);
  });

  it('logs in successfully', async () => {
    const response = await request(app).post('/api/auth/login').send(registerPayload);
    expect(response.status).toBe(200);
    expect(response.body.user.email).toBe(registerPayload.email);
    expect(response.body.token).toEqual(expect.any(String));
  });

  it('rejects an incorrect password', async () => {
    const response = await request(app).post('/api/auth/login').send({ ...registerPayload, password: 'wrong-password' });
    expect(response.status).toBe(401);
    expect(response.body.code).toBe('INVALID_CREDENTIALS');
  });

  it('rejects a missing user', async () => {
    const response = await request(app).post('/api/auth/login').send({ email: 'missing@example.com', password: registerPayload.password });
    expect(response.status).toBe(401);
    expect(response.body.code).toBe('INVALID_CREDENTIALS');
  });
});

describe('GET /api/auth/me', () => {
  it('returns the user for a valid token', async () => {
    const login = await request(app).post('/api/auth/register').send(registerPayload);
    const response = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${login.body.token}`);
    expect(response.status).toBe(200);
    expect(response.body.user.email).toBe(registerPayload.email);
  });

  it('rejects an invalid token', async () => {
    const response = await request(app).get('/api/auth/me').set('Authorization', 'Bearer invalid-token');
    expect(response.status).toBe(401);
    expect(response.body.code).toBe('INVALID_TOKEN');
  });

  it('rejects a missing token', async () => {
    const response = await request(app).get('/api/auth/me');
    expect(response.status).toBe(401);
    expect(response.body.code).toBe('UNAUTHORIZED');
  });
});
