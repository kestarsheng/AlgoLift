// 处理认证模块 HTTP 请求并统一转换输入和错误响应。
import { NextFunction, Request, Response } from 'express';
import { isLoginDto, isRegisterDto } from './auth.dto';
import { AuthError, getUser, login, register } from './auth.service';

const handleError = (error: unknown, next: NextFunction): void => {
  if (error instanceof AuthError) { next(Object.assign(error, { statusCode: error.statusCode })); return; }
  next(error);
};

export const registerUser = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
  try { if (!isRegisterDto(request.body)) throw new AuthError('VALIDATION_ERROR', 'Invalid registration payload', 400); response.status(201).json(await register(request.body)); } catch (error: unknown) { handleError(error, next); }
};

export const loginUser = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
  try { if (!isLoginDto(request.body)) throw new AuthError('VALIDATION_ERROR', 'Invalid login payload', 400); response.json(await login(request.body)); } catch (error: unknown) { handleError(error, next); }
};

export const currentUser = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
  try { response.json({ user: await getUser(request.auth!.sub) }); } catch (error: unknown) { handleError(error, next); }
};
