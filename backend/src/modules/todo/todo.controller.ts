// 处理待办 CRUD 请求并转交统一错误中间件。
import { NextFunction, Request, Response } from 'express';
import { isTodoInput, isTodoPatch, parseTodoQuery } from './todo.dto';
import * as service from './todo.service';
import { ApiError, parseIdParam } from '../../lib/errors';
export const getTodos = async (req: Request, res: Response, next: NextFunction): Promise<void> => { try { res.json(await service.listTodos(req.auth!.sub, parseTodoQuery(req.query))); } catch (e: unknown) { next(e); } };
export const getTodo = async (req: Request, res: Response, next: NextFunction): Promise<void> => { try { res.json(await service.getTodo(req.auth!.sub, parseIdParam(req, 'todoId'))); } catch (e: unknown) { next(e); } };
export const postTodo = async (req: Request, res: Response, next: NextFunction): Promise<void> => { try { if (!isTodoInput(req.body)) throw new ApiError(400, 'INVALID_TODO_INPUT', 'Invalid todo payload'); res.status(201).json(await service.createTodo(req.auth!.sub, req.body)); } catch (e: unknown) { next(e); } };
export const patchTodo = async (req: Request, res: Response, next: NextFunction): Promise<void> => { try { if (!isTodoPatch(req.body)) throw new ApiError(400, 'INVALID_TODO_INPUT', 'Invalid todo payload'); res.json(await service.updateTodo(req.auth!.sub, parseIdParam(req, 'todoId'), req.body)); } catch (e: unknown) { next(e); } };
export const removeTodo = async (req: Request, res: Response, next: NextFunction): Promise<void> => { try { await service.deleteTodo(req.auth!.sub, parseIdParam(req, 'todoId')); res.status(204).send(); } catch (e: unknown) { next(e); } };
