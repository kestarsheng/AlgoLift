// 定义题目练习记录路由及 Swagger 文档。
import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import * as controller from './practice-record.controller';
export const practiceRecordRouter = Router(); practiceRecordRouter.use(requireAuth);
/** @swagger
 * /problems/{problemId}/practice-records:
 *   get:
 *     summary: List practice records for a problem
 *     security: [{ bearerAuth: [] }]
 *     responses: { 200: { description: Practice history }, 404: { description: Problem not found } }
 *   post:
 *     summary: Record one practice attempt
 *     security: [{ bearerAuth: [] }]
 *     responses: { 201: { description: Created }, 400: { description: Invalid record }, 404: { description: Problem not found } }
 */
practiceRecordRouter.get('/problems/:problemId/practice-records', controller.getPracticeRecords);
practiceRecordRouter.post('/problems/:problemId/practice-records', controller.postPracticeRecord);
/** @swagger
 * /problems/{problemId}/practice-records/{recordId}:
 *   delete:
 *     summary: Delete one practice record
 *     security: [{ bearerAuth: [] }]
 *     responses: { 204: { description: Deleted }, 404: { description: Practice record not found } }
 */
practiceRecordRouter.delete('/problems/:problemId/practice-records/:recordId', controller.removePracticeRecord);
practiceRecordRouter.patch('/problems/:problemId/practice-records/:recordId', controller.patchPracticeRecord);
