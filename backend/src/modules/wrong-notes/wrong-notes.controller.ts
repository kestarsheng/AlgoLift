// 处理错题关联笔记请求并转交统一错误中间件。
import { NextFunction, Request, Response } from 'express';
import { isNoteIdsInput } from './wrong-notes.dto';
import * as service from './wrong-notes.service';
import { ApiError, parseIdParam } from '../../lib/errors';

export const getWrongNotes = async (req: Request, res: Response, next: NextFunction): Promise<void> => { try { res.json(await service.getWrongNotes(req.auth!.sub, parseIdParam(req, 'wrongId'))); } catch (error: unknown) { next(error); } };
export const putWrongNotes = async (req: Request, res: Response, next: NextFunction): Promise<void> => { try { if (!isNoteIdsInput(req.body)) throw new ApiError(400, 'INVALID_NOTE_IDS', 'Note IDs are invalid'); res.json(await service.replaceWrongNotes(req.auth!.sub, parseIdParam(req, 'wrongId'), req.body)); } catch (error: unknown) { next(error); } };
export const deleteWrongNote = async (req: Request, res: Response, next: NextFunction): Promise<void> => { try { await service.removeWrongNote(req.auth!.sub, parseIdParam(req, 'wrongId'), parseIdParam(req, 'noteId')); res.status(204).send(); } catch (error: unknown) { next(error); } };
