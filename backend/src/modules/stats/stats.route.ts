// 定义数据概览统计路由及 Swagger 文档。
import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import * as controller from './stats.controller';
export const statsRouter = Router(); statsRouter.use(requireAuth);
/** @swagger
 * /stats/dashboard:
 *   get: { summary: Aggregate dashboard stats with difficulty distribution and daily practice counts, security: [{ bearerAuth: [] }], parameters: [{ in: query, name: days, required: false, schema: { type: integer, default: 119, minimum: 1, maximum: 365 } }], responses: { 200: { description: OK }, 401: { description: Unauthorized } } }
 * /stats/suggestions:
 *   get: { summary: Generate learning suggestions based on user data, security: [{ bearerAuth: [] }], responses: { 200: { description: OK }, 401: { description: Unauthorized } } }
 */
statsRouter.get('/stats/dashboard', controller.getDashboard);
statsRouter.get('/stats/suggestions', controller.getSuggestions);
