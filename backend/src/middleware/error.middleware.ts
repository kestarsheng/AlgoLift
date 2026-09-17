// 统一处理后端请求错误并返回标准错误结构。
import { ErrorRequestHandler } from 'express';

export const errorMiddleware: ErrorRequestHandler = (error, _request, response, _next) => {
  const statusCode = typeof error.statusCode === 'number' ? error.statusCode : 500;
  const message = error instanceof Error ? error.message : 'Internal server error';
  const code = typeof error.code === 'string' ? error.code : String(statusCode);
  response.status(statusCode).json({ code, message });
};
