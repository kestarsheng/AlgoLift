// 处理题目关联笔记请求并转交统一错误中间件。
import { NextFunction, Request, Response } from 'express';
import { isNoteIdsInput } from './problem-notes.dto';
import * as service from './problem-notes.service';

const param = (req: Request, name: string): string => {
  const value = req.params[name];
  if (!value || Array.isArray(value)) throw new service.ProblemNotesError('VALIDATION_ERROR', 'Invalid route parameter', 400);
  return value;
};

export const putProblemNotes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!isNoteIdsInput(req.body)) throw new service.ProblemNotesError('INVALID_NOTE_IDS', 'Note IDs are invalid', 400);
    res.json(await service.replaceProblemNotes(req.auth!.sub, param(req, 'problemId'), req.body));
  } catch (error: unknown) { next(error); }
};
