// 提供服务存活检查接口的控制器。
import { Request, Response } from 'express';

export const getHealth = (_request: Request, response: Response): void => {
  response.status(200).json({ status: 'ok' });
};
