// 处理练习记录 HTTP 请求并转交统一错误中间件。
import { NextFunction, Request, Response } from 'express';
import { isCreatePracticeRecordInput, isUpdatePracticeRecordInput, parsePracticeRecordQuery } from './practice-record.dto';
import * as service from './practice-record.service';
import { ApiError, parseIdParam } from '../../lib/errors';
export const getPracticeRecords = async (req: Request, res: Response, next: NextFunction): Promise<void> => { try { res.json(await service.listPracticeRecords(req.auth!.sub, parseIdParam(req, 'problemId'), parsePracticeRecordQuery(req.query))); } catch (error: unknown) { next(error); } };
export const postPracticeRecord = async (req: Request, res: Response, next: NextFunction): Promise<void> => { try { if (!isCreatePracticeRecordInput(req.body)) throw new ApiError(400, 'INVALID_PRACTICE_RECORD', 'Invalid practice record payload'); res.status(201).json(await service.createPracticeRecord(req.auth!.sub, parseIdParam(req, 'problemId'), req.body)); } catch (error: unknown) { next(error); } };
export const removePracticeRecord = async (req: Request, res: Response, next: NextFunction): Promise<void> => { try { await service.deletePracticeRecord(req.auth!.sub, parseIdParam(req, 'problemId'), parseIdParam(req, 'recordId')); res.status(204).send(); } catch (error: unknown) { next(error); } };
export const patchPracticeRecord = async (req: Request, res: Response, next: NextFunction): Promise<void> => { try { if (!isUpdatePracticeRecordInput(req.body)) throw new ApiError(400, 'INVALID_PRACTICE_RECORD', 'Invalid practice record payload'); res.json(await service.updatePracticeRecord(req.auth!.sub, parseIdParam(req, 'problemId'), parseIdParam(req, 'recordId'), req.body)); } catch (error: unknown) { next(error); } };
