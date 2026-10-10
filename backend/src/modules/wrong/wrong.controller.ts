// 处理错题 CRUD 请求并转交统一错误中间件。
import { NextFunction, Request, Response } from 'express';
import { isWrongInput, isWrongPatch, parseWrongQuery } from './wrong.dto';
import * as service from './wrong.service';
import { ApiError, parseIdParam } from '../../lib/errors';
export const getWrongs = async (req: Request, res: Response, next: NextFunction): Promise<void> => { try { res.json(await service.listWrongs(req.auth!.sub, parseWrongQuery(req.query))); } catch (e: unknown) { next(e); } };
export const getWrong = async (req: Request, res: Response, next: NextFunction): Promise<void> => { try { res.json(await service.getWrong(req.auth!.sub, parseIdParam(req, 'wrongId'))); } catch (e: unknown) { next(e); } };
export const postWrong = async (req: Request, res: Response, next: NextFunction): Promise<void> => { try { if (!isWrongInput(req.body)) throw new ApiError(400, 'INVALID_WRONG_INPUT', 'Invalid wrong payload'); res.status(201).json(await service.createWrong(req.auth!.sub, req.body)); } catch (e: unknown) { next(e); } };
export const patchWrong = async (req: Request, res: Response, next: NextFunction): Promise<void> => { try { if (!isWrongPatch(req.body)) throw new ApiError(400, 'INVALID_WRONG_INPUT', 'Invalid wrong payload'); res.json(await service.updateWrong(req.auth!.sub, parseIdParam(req, 'wrongId'), req.body)); } catch (e: unknown) { next(e); } };
export const removeWrong = async (req: Request, res: Response, next: NextFunction): Promise<void> => { try { await service.deleteWrong(req.auth!.sub, parseIdParam(req, 'wrongId')); res.status(204).send(); } catch (e: unknown) { next(e); } };
