// 定义待办 CRUD 路由及 Swagger 文档。
import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import * as controller from './todo.controller';
export const todoRouter = Router(); todoRouter.use(requireAuth);
/** @swagger
 * /todos:
 *   get: { summary: List todos, security: [{ bearerAuth: [] }], responses: { 200: { description: OK }, 400: { description: Invalid query } } }
 *   post: { summary: Create todo, security: [{ bearerAuth: [] }], responses: { 201: { description: Created }, 400: { description: Invalid payload } } }
 * /todos/{todoId}:
 *   get: { summary: Get todo, security: [{ bearerAuth: [] }], responses: { 200: { description: OK }, 404: { description: Not found } } }
 *   patch: { summary: Update todo, security: [{ bearerAuth: [] }], responses: { 200: { description: Updated }, 400: { description: Invalid payload }, 404: { description: Not found } } }
 *   delete: { summary: Delete todo, security: [{ bearerAuth: [] }], responses: { 204: { description: Deleted }, 404: { description: Not found } } }
 */
todoRouter.get('/todos', controller.getTodos); todoRouter.post('/todos', controller.postTodo); todoRouter.get('/todos/:todoId', controller.getTodo); todoRouter.patch('/todos/:todoId', controller.patchTodo); todoRouter.delete('/todos/:todoId', controller.removeTodo);
