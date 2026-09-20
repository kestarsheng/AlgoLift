// 创建 Prisma Client 单例，供后端模块访问 PostgreSQL。
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();
