// 处理待办 CRUD 请求并转交统一错误中间件。
import { NextFunction, Request, Response } from 'express';
import { isTodoInput, isTodoPatch, parseTodoQuery } from './todo.dto';
import * as service from './todo.service';
const param = (req: Request): string => { const value = req.params.todoId; if (!value || Array.isArray(value)) throw new service.TodoError('INVALID_TODO_INPUT', 'Invalid todo ID', 400); return value; };
export const getTodos = async (req: Request, res: Response, next: NextFunction): Promise<void> => { try { res.json(await service.listTodos(req.auth!.sub, parseTodoQuery(req.query))); } catch (e: unknown) { next(e); } };
export const getTodo = async (req: Request, res: Response, next: NextFunction): Promise<void> => { try { res.json(await service.getTodo(req.auth!.sub, param(req))); } catch (e: unknown) { next(e); } };
export const postTodo = async (req: Request, res: Response, next: NextFunction): Promise<void> => { try { if (!isTodoInput(req.body)) throw new service.TodoError('INVALID_TODO_INPUT', 'Invalid todo payload', 400); res.status(201).json(await service.createTodo(req.auth!.sub, req.body)); } catch (e: unknown) { next(e); } };
export const patchTodo = async (req: Request, res: Response, next: NextFunction): Promise<void> => { try { if (!isTodoPatch(req.body)) throw new service.TodoError('INVALID_TODO_INPUT', 'Invalid todo payload', 400); res.json(await service.updateTodo(req.auth!.sub, param(req), req.body)); } catch (e: unknown) { next(e); } };
export const removeTodo = async (req: Request, res: Response, next: NextFunction): Promise<void> => { try { await service.deleteTodo(req.auth!.sub, param(req)); res.status(204).send(); } catch (e: unknown) { next(e); } };
