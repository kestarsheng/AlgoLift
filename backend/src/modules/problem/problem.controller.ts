// 处理题目 CRUD 请求并转交统一错误中间件。
import { NextFunction, Request, Response } from 'express';
import { isCreateProblemInput, isUpdateProblemInput, parseProblemQuery } from './problem.dto';
import * as service from './problem.service';
const param = (req: Request): string => { const value = req.params.problemId; if (!value || Array.isArray(value)) throw new service.ProblemError('VALIDATION_ERROR', 'Invalid route parameter', 400); return value; };
export const getProblems = async (req: Request, res: Response, next: NextFunction): Promise<void> => { try { res.json(await service.listProblems(req.auth!.sub, parseProblemQuery(req.query))); } catch (error: unknown) { next(error); } };
export const getProblem = async (req: Request, res: Response, next: NextFunction): Promise<void> => { try { res.json(await service.getProblem(req.auth!.sub, param(req))); } catch (error: unknown) { next(error); } };
export const postProblem = async (req: Request, res: Response, next: NextFunction): Promise<void> => { try { if (!isCreateProblemInput(req.body)) throw new service.ProblemError('INVALID_PROBLEM_INPUT', 'Invalid problem payload', 400); res.status(201).json(await service.createProblem(req.auth!.sub, req.body)); } catch (error: unknown) { next(error); } };
export const patchProblem = async (req: Request, res: Response, next: NextFunction): Promise<void> => { try { if (!isUpdateProblemInput(req.body)) throw new service.ProblemError('INVALID_PROBLEM_INPUT', 'Invalid problem payload', 400); res.json(await service.updateProblem(req.auth!.sub, param(req), req.body)); } catch (error: unknown) { next(error); } };
export const removeProblem = async (req: Request, res: Response, next: NextFunction): Promise<void> => { try { await service.deleteProblem(req.auth!.sub, param(req)); res.status(204).send(); } catch (error: unknown) { next(error); } };
