// 定义错题与题解笔记关联路由及 Swagger 文档。
import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import * as controller from './wrong-notes.controller';

export const wrongNotesRouter = Router();
wrongNotesRouter.use(requireAuth);

/** @swagger
 * /wrongs/{wrongId}/notes:
 *   get:
 *     summary: List a wrong's linked notes
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: wrongId, required: true, schema: { type: string, format: uuid } }]
 *     responses: { 200: { description: Linked notes }, 404: { description: Wrong not found } }
 *   put:
 *     summary: Replace a wrong's linked notes
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: wrongId, required: true, schema: { type: string, format: uuid } }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object, required: [noteIds], properties: { noteIds: { type: array, items: { type: string, format: uuid } } } }
 *     responses: { 200: { description: Notes replaced }, 400: { description: Invalid note IDs }, 403: { description: Note unavailable }, 404: { description: Wrong not found } }
 * /wrongs/{wrongId}/notes/{noteId}:
 *   delete:
 *     summary: Remove one wrong-note link
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: wrongId, required: true, schema: { type: string, format: uuid } }
 *       - { in: path, name: noteId, required: true, schema: { type: string, format: uuid } }
 *     responses: { 204: { description: Link removed }, 404: { description: Wrong or link not found } }
 */
wrongNotesRouter.get('/wrongs/:wrongId/notes', controller.getWrongNotes);
wrongNotesRouter.put('/wrongs/:wrongId/notes', controller.putWrongNotes);
wrongNotesRouter.delete('/wrongs/:wrongId/notes/:noteId', controller.deleteWrongNote);
