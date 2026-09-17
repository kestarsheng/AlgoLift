// 定义题目与题解笔记关联路由及 Swagger 文档。
import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import { putProblemNotes } from './problem-notes.controller';

export const problemNotesRouter = Router();
problemNotesRouter.use(requireAuth);

/** @swagger
 * /problems/{problemId}/notes:
 *   put:
 *     summary: Replace a problem's linked notes
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: problemId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [noteIds]
 *             properties:
 *               noteIds: { type: array, items: { type: string, format: uuid } }
 *     responses:
 *       200: { description: Notes replaced }
 *       400: { description: Invalid note IDs }
 *       403: { description: Note unavailable }
 *       404: { description: Problem not found }
 */
problemNotesRouter.put('/problems/:problemId/notes', putProblemNotes);
