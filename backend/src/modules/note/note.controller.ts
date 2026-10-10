// 处理题解笔记 CRUD 请求并转交统一错误中间件。
import { NextFunction, Request, Response } from 'express';
import { isNoteInput, isNotePatch, parseNoteQuery } from './note.dto';
import * as service from './note.service';
import { ApiError, parseIdParam } from '../../lib/errors';
export const getNotes = async (req: Request, res: Response, next: NextFunction): Promise<void> => { try { res.json(await service.listNotes(req.auth!.sub, parseNoteQuery(req.query))); } catch (e: unknown) { next(e); } };
export const getNote = async (req: Request, res: Response, next: NextFunction): Promise<void> => { try { res.json(await service.getNote(req.auth!.sub, parseIdParam(req, 'noteId'))); } catch (e: unknown) { next(e); } };
export const postNote = async (req: Request, res: Response, next: NextFunction): Promise<void> => { try { if (!isNoteInput(req.body)) throw new ApiError(400, 'INVALID_NOTE_INPUT', 'Invalid note payload'); res.status(201).json(await service.createNote(req.auth!.sub, req.body)); } catch (e: unknown) { next(e); } };
export const patchNote = async (req: Request, res: Response, next: NextFunction): Promise<void> => { try { if (!isNotePatch(req.body)) throw new ApiError(400, 'INVALID_NOTE_INPUT', 'Invalid note payload'); res.json(await service.updateNote(req.auth!.sub, parseIdParam(req, 'noteId'), req.body)); } catch (e: unknown) { next(e); } };
export const removeNote = async (req: Request, res: Response, next: NextFunction): Promise<void> => { try { await service.deleteNote(req.auth!.sub, parseIdParam(req, 'noteId')); res.status(204).send(); } catch (e: unknown) { next(e); } };
export const getNoteWrongs = async (req: Request, res: Response, next: NextFunction): Promise<void> => { try { res.json(await service.getNoteWrongs(req.auth!.sub, parseIdParam(req, 'noteId'))); } catch (e: unknown) { next(e); } };
