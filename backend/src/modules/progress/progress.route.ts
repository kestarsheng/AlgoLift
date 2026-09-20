// 定义学习进度 CRUD 路由及 Swagger 文档。
import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import * as controller from './progress.controller';
export const progressRouter = Router(); progressRouter.use(requireAuth);
/** @swagger
 * /progresses:
 *   get: { summary: List learning progresses, security: [{ bearerAuth: [] }], responses: { 200: { description: OK }, 400: { description: Invalid query } } }
 *   post: { summary: Create learning progress, security: [{ bearerAuth: [] }], responses: { 201: { description: Created }, 400: { description: Invalid payload } } }
 * /progresses/{progressId}:
 *   get: { summary: Get learning progress, security: [{ bearerAuth: [] }], responses: { 200: { description: OK }, 404: { description: Not found } } }
 *   patch: { summary: Update learning progress, security: [{ bearerAuth: [] }], responses: { 200: { description: Updated }, 400: { description: Invalid payload }, 404: { description: Not found } } }
 *   delete: { summary: Delete learning progress, security: [{ bearerAuth: [] }], responses: { 204: { description: Deleted }, 404: { description: Not found } } }
 */
progressRouter.get('/progresses', controller.getProgresses); progressRouter.post('/progresses', controller.postProgress); progressRouter.get('/progresses/:progressId', controller.getProgress); progressRouter.patch('/progresses/:progressId', controller.patchProgress); progressRouter.delete('/progresses/:progressId', controller.removeProgress);
