// 定义错题 CRUD 路由及 Swagger 文档。
import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import * as controller from './wrong.controller';
export const wrongRouter = Router(); wrongRouter.use(requireAuth);
/** @swagger
 * /wrongs:
 *   get: { summary: List wrongs, security: [{ bearerAuth: [] }], responses: { 200: { description: OK } } }
 *   post: { summary: Create wrong, security: [{ bearerAuth: [] }], responses: { 201: { description: Created }, 400: { description: Invalid payload } } }
 * /wrongs/{wrongId}:
 *   get: { summary: Get wrong, security: [{ bearerAuth: [] }], responses: { 200: { description: OK }, 404: { description: Not found } } }
 *   patch: { summary: Update wrong, security: [{ bearerAuth: [] }], responses: { 200: { description: Updated }, 400: { description: Invalid payload }, 404: { description: Not found } } }
 *   delete: { summary: Delete wrong, security: [{ bearerAuth: [] }], responses: { 204: { description: Deleted }, 404: { description: Not found } } }
 */
wrongRouter.get('/wrongs', controller.getWrongs); wrongRouter.post('/wrongs', controller.postWrong); wrongRouter.get('/wrongs/:wrongId', controller.getWrong); wrongRouter.patch('/wrongs/:wrongId', controller.patchWrong); wrongRouter.delete('/wrongs/:wrongId', controller.removeWrong);
