// 处理题目关联笔记请求并转交统一错误中间件。
import { NextFunction, Request, Response } from 'express';
import { isNoteIdsInput } from './problem-notes.dto';
import * as service from './problem-notes.service';
import { ApiError, parseIdParam } from '../../lib/errors';

export const putProblemNotes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!isNoteIdsInput(req.body)) throw new ApiError(400, 'INVALID_NOTE_IDS', 'Note IDs are invalid');
    res.json(await service.replaceProblemNotes(req.auth!.sub, parseIdParam(req, 'problemId'), req.body));
  } catch (error: unknown) { next(error); }
};
