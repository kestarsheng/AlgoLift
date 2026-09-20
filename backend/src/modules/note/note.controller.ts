// 处理题解笔记 CRUD 请求并转交统一错误中间件。
import { NextFunction, Request, Response } from 'express';
import { isNoteInput, isNotePatch, parseNoteQuery } from './note.dto';
import * as service from './note.service';
const param = (req: Request): string => { const value = req.params.noteId; if (!value || Array.isArray(value)) throw new service.NoteError('INVALID_NOTE_INPUT', 'Invalid note ID', 400); return value; };
export const getNotes = async (req: Request, res: Response, next: NextFunction): Promise<void> => { try { res.json(await service.listNotes(req.auth!.sub, parseNoteQuery(req.query))); } catch (e: unknown) { next(e); } };
export const getNote = async (req: Request, res: Response, next: NextFunction): Promise<void> => { try { res.json(await service.getNote(req.auth!.sub, param(req))); } catch (e: unknown) { next(e); } };
export const postNote = async (req: Request, res: Response, next: NextFunction): Promise<void> => { try { if (!isNoteInput(req.body)) throw new service.NoteError('INVALID_NOTE_INPUT', 'Invalid note payload', 400); res.status(201).json(await service.createNote(req.auth!.sub, req.body)); } catch (e: unknown) { next(e); } };
export const patchNote = async (req: Request, res: Response, next: NextFunction): Promise<void> => { try { if (!isNotePatch(req.body)) throw new service.NoteError('INVALID_NOTE_INPUT', 'Invalid note payload', 400); res.json(await service.updateNote(req.auth!.sub, param(req), req.body)); } catch (e: unknown) { next(e); } };
export const removeNote = async (req: Request, res: Response, next: NextFunction): Promise<void> => { try { await service.deleteNote(req.auth!.sub, param(req)); res.status(204).send(); } catch (e: unknown) { next(e); } };
