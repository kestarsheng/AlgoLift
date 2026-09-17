// 定义题解笔记 CRUD 路由及 Swagger 文档。
import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import * as controller from './note.controller';
export const noteRouter = Router(); noteRouter.use(requireAuth);
/** @swagger
 * /notes:
 *   get: { summary: List notes, security: [{ bearerAuth: [] }], responses: { 200: { description: OK } } }
 *   post: { summary: Create note, security: [{ bearerAuth: [] }], responses: { 201: { description: Created }, 400: { description: Invalid payload } } }
 * /notes/{noteId}:
 *   get: { summary: Get note, security: [{ bearerAuth: [] }], responses: { 200: { description: OK }, 404: { description: Not found } } }
 *   patch: { summary: Update note, security: [{ bearerAuth: [] }], responses: { 200: { description: Updated }, 400: { description: Invalid payload }, 404: { description: Not found } } }
 *   delete: { summary: Delete note, security: [{ bearerAuth: [] }], responses: { 204: { description: Deleted }, 404: { description: Not found } } }
 */
noteRouter.get('/notes', controller.getNotes); noteRouter.post('/notes', controller.postNote); noteRouter.get('/notes/:noteId', controller.getNote); noteRouter.patch('/notes/:noteId', controller.patchNote); noteRouter.delete('/notes/:noteId', controller.removeNote);
