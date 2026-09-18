// 处理错题关联笔记请求并转交统一错误中间件。
import { NextFunction, Request, Response } from 'express';
import { isNoteIdsInput } from './wrong-notes.dto';
import * as service from './wrong-notes.service';

const param = (req: Request, name: string): string => {
  const value = req.params[name];
  if (!value || Array.isArray(value)) throw new service.WrongNotesError('INVALID_WRONG_INPUT', 'Invalid route parameter', 400);
  return value;
};

export const getWrongNotes = async (req: Request, res: Response, next: NextFunction): Promise<void> => { try { res.json(await service.getWrongNotes(req.auth!.sub, param(req, 'wrongId'))); } catch (error: unknown) { next(error); } };
export const putWrongNotes = async (req: Request, res: Response, next: NextFunction): Promise<void> => { try { if (!isNoteIdsInput(req.body)) throw new service.WrongNotesError('INVALID_NOTE_IDS', 'Note IDs are invalid', 400); res.json(await service.replaceWrongNotes(req.auth!.sub, param(req, 'wrongId'), req.body)); } catch (error: unknown) { next(error); } };
export const deleteWrongNote = async (req: Request, res: Response, next: NextFunction): Promise<void> => { try { await service.removeWrongNote(req.auth!.sub, param(req, 'wrongId'), param(req, 'noteId')); res.status(204).send(); } catch (error: unknown) { next(error); } };
