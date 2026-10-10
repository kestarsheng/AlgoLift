// 处理认证模块 HTTP 请求并统一转换输入和错误响应。
import { NextFunction, Request, Response } from 'express';
import { isLoginDto, isRegisterDto } from './auth.dto';
import { getUser, login, register } from './auth.service';
import { ApiError } from '../../lib/errors';

export const registerUser = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
  try { if (!isRegisterDto(request.body)) throw new ApiError(400, 'VALIDATION_ERROR', 'Invalid registration payload'); response.status(201).json(await register(request.body)); } catch (error: unknown) { next(error); }
};

export const loginUser = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
  try { if (!isLoginDto(request.body)) throw new ApiError(400, 'VALIDATION_ERROR', 'Invalid login payload'); response.json(await login(request.body)); } catch (error: unknown) { next(error); }
};

export const currentUser = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
  try { response.json({ user: await getUser(request.auth!.sub) }); } catch (error: unknown) { next(error); }
};
