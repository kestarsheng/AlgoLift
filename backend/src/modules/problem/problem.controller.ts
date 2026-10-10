// 处理题目 CRUD 请求并转交统一错误中间件。
import { NextFunction, Request, Response } from 'express';
import { isCreateProblemInput, isUpdateProblemInput, parseProblemQuery } from './problem.dto';
import * as service from './problem.service';
import { ApiError, parseIdParam } from '../../lib/errors';
export const getProblems = async (req: Request, res: Response, next: NextFunction): Promise<void> => { try { res.json(await service.listProblems(req.auth!.sub, parseProblemQuery(req.query))); } catch (error: unknown) { next(error); } };
export const getProblem = async (req: Request, res: Response, next: NextFunction): Promise<void> => { try { res.json(await service.getProblem(req.auth!.sub, parseIdParam(req, 'problemId'))); } catch (error: unknown) { next(error); } };
export const postProblem = async (req: Request, res: Response, next: NextFunction): Promise<void> => { try { if (!isCreateProblemInput(req.body)) throw new ApiError(400, 'INVALID_PROBLEM_INPUT', 'Invalid problem payload'); res.status(201).json(await service.createProblem(req.auth!.sub, req.body)); } catch (error: unknown) { next(error); } };
export const patchProblem = async (req: Request, res: Response, next: NextFunction): Promise<void> => { try { if (!isUpdateProblemInput(req.body)) throw new ApiError(400, 'INVALID_PROBLEM_INPUT', 'Invalid problem payload'); res.json(await service.updateProblem(req.auth!.sub, parseIdParam(req, 'problemId'), req.body)); } catch (error: unknown) { next(error); } };
export const removeProblem = async (req: Request, res: Response, next: NextFunction): Promise<void> => { try { await service.deleteProblem(req.auth!.sub, parseIdParam(req, 'problemId')); res.status(204).send(); } catch (error: unknown) { next(error); } };
