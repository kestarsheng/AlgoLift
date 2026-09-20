// 处理统计模块 HTTP 请求并统一转交错误中间件。
import { NextFunction, Request, Response } from 'express';
import * as service from './stats.service';

export const getDashboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const days = Math.min(365, Math.max(1, Number(req.query.days) || 119));
    res.json(await service.getDashboardStats(req.auth!.sub, days));
  } catch (error: unknown) { next(error); }
};
