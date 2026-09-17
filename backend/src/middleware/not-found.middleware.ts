// 处理未匹配路由并返回统一错误结构。
import { RequestHandler } from 'express';

export const notFoundMiddleware: RequestHandler = (_request, response) => {
  response.status(404).json({ code: 404, message: 'Route not found' });
};
