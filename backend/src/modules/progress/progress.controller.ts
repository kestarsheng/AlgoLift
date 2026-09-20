// 处理学习进度 CRUD 请求并转交统一错误中间件。
import { NextFunction, Request, Response } from 'express';
import { isProgressInput, isProgressPatch, parseProgressQuery } from './progress.dto';
import * as service from './progress.service';
const param = (req: Request): string => { const value = req.params.progressId; if (!value || Array.isArray(value)) throw new service.ProgressError('INVALID_PROGRESS_INPUT', 'Invalid progress ID', 400); return value; };
export const getProgresses = async (req: Request, res: Response, next: NextFunction): Promise<void> => { try { res.json(await service.listProgresses(req.auth!.sub, parseProgressQuery(req.query))); } catch (e: unknown) { next(e); } };
export const getProgress = async (req: Request, res: Response, next: NextFunction): Promise<void> => { try { res.json(await service.getProgress(req.auth!.sub, param(req))); } catch (e: unknown) { next(e); } };
export const postProgress = async (req: Request, res: Response, next: NextFunction): Promise<void> => { try { if (!isProgressInput(req.body)) throw new service.ProgressError('INVALID_PROGRESS_INPUT', 'Invalid progress payload', 400); res.status(201).json(await service.createProgress(req.auth!.sub, req.body)); } catch (e: unknown) { next(e); } };
export const patchProgress = async (req: Request, res: Response, next: NextFunction): Promise<void> => { try { if (!isProgressPatch(req.body)) throw new service.ProgressError('INVALID_PROGRESS_INPUT', 'Invalid progress payload', 400); res.json(await service.updateProgress(req.auth!.sub, param(req), req.body)); } catch (e: unknown) { next(e); } };
export const removeProgress = async (req: Request, res: Response, next: NextFunction): Promise<void> => { try { await service.deleteProgress(req.auth!.sub, param(req)); res.status(204).send(); } catch (e: unknown) { next(e); } };
