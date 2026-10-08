// 处理全局搜索请求并转交统一错误中间件。
import { NextFunction, Request, Response } from 'express';
import { parseSearchQuery } from './search.dto';
import * as service from './search.service';
export const search = async (req: Request, res: Response, next: NextFunction): Promise<void> => { try { res.json(await service.search(req.auth!.sub, parseSearchQuery(req.query))); } catch (e: unknown) { next(e); } };