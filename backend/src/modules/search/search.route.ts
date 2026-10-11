// 定义全局搜索路由及 Swagger 文档。
import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import * as controller from './search.controller';
export const searchRouter = Router(); searchRouter.use(requireAuth);
/** @swagger
 * /search:
 *   get: { summary: Global search across problems, wrongs, notes and todos, security: [{ bearerAuth: [] }], responses: { 200: { description: OK } } }
 */
searchRouter.get('/search', controller.search);