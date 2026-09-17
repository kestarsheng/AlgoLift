// 定义分类及题目分类关联路由与 Swagger 文档。
import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import * as controller from './category.controller';

export const categoryRouter = Router();
categoryRouter.use(requireAuth);
/** @swagger
 * /categories:
 *   get: { summary: List non-empty categories by default, security: [{ bearerAuth: [] }], responses: { 200: { description: OK }, 401: { description: Unauthorized } } }
 *   post: { summary: Create a category, security: [{ bearerAuth: [] }], responses: { 201: { description: Created }, 400: { description: Invalid payload }, 409: { description: Duplicate name } } }
 */
categoryRouter.get('/categories', controller.getCategories);
categoryRouter.post('/categories', controller.postCategory);
/** @swagger
 * /categories/{categoryId}:
 *   patch: { summary: Rename a category, security: [{ bearerAuth: [] }], parameters: [{ in: path, name: categoryId, required: true, schema: { type: string, format: uuid } }], responses: { 200: { description: Updated }, 404: { description: Not found }, 409: { description: Duplicate name } } }
 *   delete: { summary: Delete a category and its bindings, security: [{ bearerAuth: [] }], parameters: [{ in: path, name: categoryId, required: true, schema: { type: string, format: uuid } }], responses: { 204: { description: Deleted }, 404: { description: Not found } } }
 */
categoryRouter.patch('/categories/:categoryId', controller.patchCategory);
categoryRouter.delete('/categories/:categoryId', controller.removeCategory);
/** @swagger
 * /categories/{categoryId}/problems:
 *   get: { summary: List problems in a category, security: [{ bearerAuth: [] }], responses: { 200: { description: Paginated problems }, 404: { description: Not found } } }
 * /problems/{problemId}/categories:
 *   put: { summary: Replace a problem's categories transactionally, security: [{ bearerAuth: [] }], responses: { 200: { description: Updated }, 400: { description: Invalid category IDs }, 403: { description: Category unavailable }, 404: { description: Problem not found } } }
 */
categoryRouter.get('/categories/:categoryId/problems', controller.getCategoryProblems);
categoryRouter.put('/problems/:problemId/categories', controller.putProblemCategories);
