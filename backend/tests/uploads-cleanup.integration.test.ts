// 覆盖图片引用解析、删除实体级联清理与孤儿图片定时清理。
import fs from 'fs';
import path from 'path';
import request from 'supertest';
import { app } from '../src/app';
import { prisma } from '../src/config/prisma';
import { cleanupOrphanedImages, isSafeUploadName, parseImageRefs, UPLOAD_DIR } from '../src/lib/image-cleanup';

const testEmailPrefix = 'uploads-cleanup-test-';
const makeName = (tag: string): string => `${Date.now()}-${tag}.png`;

const register = async (): Promise<string> => {
  const email = `uploads-cleanup-test-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
  const res = await request(app).post('/api/auth/register').send({ email, password: 'strong-password' });
  return res.body.token as string;
};

const createFile = (filename: string): void => {
  fs.writeFileSync(path.join(UPLOAD_DIR, filename), Buffer.from([0x89, 0x50, 0x4e, 0x47]));
};

beforeEach(async () => {
  await prisma.user.deleteMany({ where: { email: { startsWith: testEmailPrefix } } });
});

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: { startsWith: testEmailPrefix } } });
  await prisma.$disconnect();
});

describe('parseImageRefs / isSafeUploadName', () => {
  it('解析 /uploads/<filename> 引用', () => {
    const refs = parseImageRefs('![a](/uploads/1-abc.png) 文本 ![b](/uploads/2-def.webp)');
    expect(refs.has('1-abc.png')).toBe(true);
    expect(refs.has('2-def.webp')).toBe(true);
    expect(refs.size).toBe(2);
  });
  it('忽略非安全文件名（路径穿越/非上传命名规则）', () => {
    const refs = parseImageRefs('![x](/uploads/../../etc/passwd) ![y](/uploads/avatar.png)');
    expect(refs.size).toBe(0);
    expect(isSafeUploadName('../../etc/passwd')).toBe(false);
    expect(isSafeUploadName('avatar.png')).toBe(false);
    expect(isSafeUploadName('1790000000000-a1b2c3.png')).toBe(true);
  });
  it('null/undefined 返回空集合', () => {
    expect(parseImageRefs(null).size).toBe(0);
    expect(parseImageRefs(undefined).size).toBe(0);
  });
});

describe('级联清理：删除实体时清除不再被引用的图片', () => {
  it('删除最后一个引用实体的图片被移除，仍被引用的保留', async () => {
    const token = await register();
    const fileA = makeName('filea');
    const fileB = makeName('fileb');
    createFile(fileA);
    createFile(fileB);
    const first = await request(app).post('/api/notes').set('Authorization', `Bearer ${token}`).send({ title: '第一', content: `![a](/uploads/${fileA})`, solutionLinks: [] });
    const second = await request(app).post('/api/notes').set('Authorization', `Bearer ${token}`).send({ title: '第二', content: `![a](/uploads/${fileA}) ![b](/uploads/${fileB})`, solutionLinks: [] });
    expect(first.status).toBe(201);
    expect(second.status).toBe(201);

    await request(app).delete(`/api/notes/${first.body.data.id}`).set('Authorization', `Bearer ${token}`);
    expect(fs.existsSync(path.join(UPLOAD_DIR, fileA))).toBe(true);
    expect(fs.existsSync(path.join(UPLOAD_DIR, fileB))).toBe(true);

    await request(app).delete(`/api/notes/${second.body.data.id}`).set('Authorization', `Bearer ${token}`);
    expect(fs.existsSync(path.join(UPLOAD_DIR, fileA))).toBe(false);
    expect(fs.existsSync(path.join(UPLOAD_DIR, fileB))).toBe(false);
  });

  it('删除题目时清理 internalNote 中的图片（problem/wrong/progress 共用清理组件）', async () => {
    const token = await register();
    const fileC = makeName('filec');
    createFile(fileC);
    const created = await request(app).post('/api/problems').set('Authorization', `Bearer ${token}`).send({ title: '链表题', difficulty: 'MEDIUM', internalNote: `![图](/uploads/${fileC})` });
    expect(created.status).toBe(201);
    await request(app).delete(`/api/problems/${created.body.data.id}`).set('Authorization', `Bearer ${token}`);
    expect(fs.existsSync(path.join(UPLOAD_DIR, fileC))).toBe(false);
  });
});

describe('孤儿图片定时清理', () => {
  it('超过宽限期且无引用的文件被清理；宽限期内或有引用的文件保留', async () => {
    const token = await register();
    const orphanOld = makeName('orphanold');
    const orphanFresh = makeName('orphanfresh');
    const referencedOld = makeName('referencedold');
    createFile(orphanOld);
    createFile(orphanFresh);
    createFile(referencedOld);
    const past = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    fs.utimesSync(path.join(UPLOAD_DIR, orphanOld), past, past);
    fs.utimesSync(path.join(UPLOAD_DIR, referencedOld), past, past);

    const note = await request(app).post('/api/notes').set('Authorization', `Bearer ${token}`).send({ title: '引用题', content: `![r](/uploads/${referencedOld})`, solutionLinks: [] });
    expect(note.status).toBe(201);

    const result = await cleanupOrphanedImages(24 * 60 * 60 * 1000);
    expect(result.removed).toContain(orphanOld);
    expect(fs.existsSync(path.join(UPLOAD_DIR, orphanOld))).toBe(false);
    expect(fs.existsSync(path.join(UPLOAD_DIR, orphanFresh))).toBe(true);
    expect(fs.existsSync(path.join(UPLOAD_DIR, referencedOld))).toBe(true);
  });

  it('不删除 uploads 目录外的文件（路径穿越防护）', async () => {
    const outside = makeName('outside');
    const outsidePath = path.join(UPLOAD_DIR, '..', outside);
    fs.writeFileSync(outsidePath, 'x');
    const result = await cleanupOrphanedImages(0);
    expect(result.removed).not.toContain(`../${outside}`);
    expect(fs.existsSync(outsidePath)).toBe(true);
    fs.unlinkSync(outsidePath);
  });
});