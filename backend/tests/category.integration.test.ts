// 覆盖分类模块的真实数据库集成场景。
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

const createCategory = async (token: string, name: string) => request(app).post('/api/categories').set('Authorization', `Bearer ${token}`).send({ name });

beforeEach(async () => {
  await prisma.user.deleteMany({ where: { OR: [{ email: { startsWith: 'auth-test-' } }, { email: { startsWith: 'category-test-' } }] } });
});

afterAll(async () => {
  await prisma.user.deleteMany({ where: { OR: [{ email: { startsWith: 'auth-test-' } }, { email: { startsWith: 'category-test-' } }] } });
  await prisma.$disconnect();
});

describe('category integration', () => {
  it('creates a category', async () => {
    const user = await createUser('category-test-');
    const response = await createCategory(user.token, '动态规划');
    expect(response.status).toBe(201);
    expect(response.body.data).toMatchObject({ name: '动态规划', problemCount: 0 });
  });

  it('rejects a duplicate category name', async () => {
    const user = await createUser('category-test-');
    await createCategory(user.token, '数组');
    const response = await createCategory(user.token, '数组');
    expect(response.status).toBe(409);
    expect(response.body.code).toBe('CATEGORY_NAME_EXISTS');
  });

  it.each([{ name: '' }, { name: ' '.repeat(101) }])('rejects invalid name: $name', async ({ name }) => {
    const user = await createUser('category-test-');
    const response = await createCategory(user.token, name);
    expect(response.status).toBe(400);
    expect(response.body.code).toBe('VALIDATION_ERROR');
  });

  it('excludes empty categories by default and includes them when requested', async () => {
    const user = await createUser('category-test-');
    const empty = await createCategory(user.token, '空分类');
    const used = await createCategory(user.token, '已使用分类');
    await prisma.problem.create({ data: { userId: user.id, title: `题目-${sequence}`, difficulty: 'EASY', categories: { create: { categoryId: used.body.data.id } } } });
    const defaultResponse = await request(app).get('/api/categories').set('Authorization', `Bearer ${user.token}`);
    const allResponse = await request(app).get('/api/categories?includeEmpty=true').set('Authorization', `Bearer ${user.token}`);
    expect(defaultResponse.body.data.map((category: { id: string }) => category.id)).not.toContain(empty.body.data.id);
    expect(defaultResponse.body.data.map((category: { id: string }) => category.id)).toContain(used.body.data.id);
    expect(allResponse.body.data.map((category: { id: string }) => category.id)).toEqual(expect.arrayContaining([empty.body.data.id, used.body.data.id]));
  });

  it('searches categories by keyword', async () => {
    const user = await createUser('category-test-');
    await createCategory(user.token, '动态规划');
    await createCategory(user.token, '二叉树');
    const response = await request(app).get('/api/categories?includeEmpty=true&keyword=动态').set('Authorization', `Bearer ${user.token}`);
    expect(response.status).toBe(200);
    expect(response.body.data.map((category: { name: string }) => category.name)).toEqual(['动态规划']);
  });

  it('renames a category', async () => {
    const user = await createUser('category-test-');
    const category = await createCategory(user.token, '旧名称');
    const response = await request(app).patch(`/api/categories/${category.body.data.id}`).set('Authorization', `Bearer ${user.token}`).send({ name: '新名称' });
    expect(response.status).toBe(200);
    expect(response.body.data.name).toBe('新名称');
  });

  it.each(['00000000-0000-0000-0000-000000000000'])('rejects renaming a missing category', async (categoryId) => {
    const user = await createUser('category-test-');
    const response = await request(app).patch(`/api/categories/${categoryId}`).set('Authorization', `Bearer ${user.token}`).send({ name: '新名称' });
    expect(response.status).toBe(404);
    expect(response.body.code).toBe('CATEGORY_NOT_FOUND');
  });

  it('rejects renaming another user category', async () => {
    const owner = await createUser('category-test-owner-');
    const other = await createUser('category-test-other-');
    const category = await createCategory(owner.token, '他人分类');
    const response = await request(app).patch(`/api/categories/${category.body.data.id}`).set('Authorization', `Bearer ${other.token}`).send({ name: '越权修改' });
    expect(response.status).toBe(404);
    expect(response.body.code).toBe('CATEGORY_NOT_FOUND');
  });

  it('deletes a category', async () => {
    const user = await createUser('category-test-');
    const category = await createCategory(user.token, '待删除');
    const response = await request(app).delete(`/api/categories/${category.body.data.id}`).set('Authorization', `Bearer ${user.token}`);
    expect(response.status).toBe(204);
    expect(await prisma.category.findUnique({ where: { id: category.body.data.id } })).toBeNull();
  });

  it.each(['00000000-0000-0000-0000-000000000000'])('rejects deleting a missing category', async (categoryId) => {
    const user = await createUser('category-test-');
    const response = await request(app).delete(`/api/categories/${categoryId}`).set('Authorization', `Bearer ${user.token}`);
    expect(response.status).toBe(404);
    expect(response.body.code).toBe('CATEGORY_NOT_FOUND');
  });

  it('rejects deleting another user category', async () => {
    const owner = await createUser('category-test-owner-');
    const other = await createUser('category-test-other-');
    const category = await createCategory(owner.token, '他人待删除');
    const response = await request(app).delete(`/api/categories/${category.body.data.id}`).set('Authorization', `Bearer ${other.token}`);
    expect(response.status).toBe(404);
    expect(response.body.code).toBe('CATEGORY_NOT_FOUND');
  });

  it('returns 401 for an unauthenticated category request', async () => {
    const response = await request(app).get('/api/categories');
    expect(response.status).toBe(401);
    expect(response.body.code).toBe('UNAUTHORIZED');
  });
});
