// 定义健康检查模块的 HTTP 路由。
import { Router } from 'express';
import { getHealth } from './health.controller';

export const healthRouter = Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Check service health
 *     responses:
 *       200:
 *         description: Service is healthy
 */
healthRouter.get('/health', getHealth);
