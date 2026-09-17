// 定义题目 CRUD 路由及 Swagger 文档。
import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import * as controller from './problem.controller';
export const problemRouter = Router();
problemRouter.use(requireAuth);
/** @swagger
 * /problems:
 *   get:
 *     summary: List problems with filters and pagination
 *     security: [{ bearerAuth: [] }]
 *     responses: { 200: { description: Problem list }, 400: { description: Invalid query }, 404: { description: Category not found } }
 *   post:
 *     summary: Create a problem
 *     security: [{ bearerAuth: [] }]
 *     responses: { 201: { description: Created }, 400: { description: Invalid payload }, 403: { description: Category unavailable }, 409: { description: Duplicate title } }
 */
problemRouter.get('/problems', controller.getProblems);
problemRouter.post('/problems', controller.postProblem);
/** @swagger
 * /problems/{problemId}:
 *   get:
 *     summary: Get problem details
 *     security: [{ bearerAuth: [] }]
 *     responses: { 200: { description: Problem detail }, 404: { description: Problem not found } }
 *   patch:
 *     summary: Update problem fields
 *     security: [{ bearerAuth: [] }]
 *     responses: { 200: { description: Updated }, 400: { description: Invalid payload }, 404: { description: Problem not found }, 409: { description: Duplicate title } }
 *   delete:
 *     summary: Delete a problem
 *     security: [{ bearerAuth: [] }]
 *     responses: { 204: { description: Deleted }, 404: { description: Problem not found } }
 */
problemRouter.get('/problems/:problemId', controller.getProblem);
problemRouter.patch('/problems/:problemId', controller.patchProblem);
problemRouter.delete('/problems/:problemId', controller.removeProblem);
