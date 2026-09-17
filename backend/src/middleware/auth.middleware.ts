// 校验 Authorization Bearer JWT，并将当前用户载荷注入请求上下文。
import { NextFunction, Request, Response } from 'express';
import { verifyToken } from '../config/security';
import { JwtPayload } from '../modules/auth/auth.dto';

declare global { namespace Express { interface Request { auth?: JwtPayload } } }

export const requireAuth = (request: Request, response: Response, next: NextFunction): void => {
  const header = request.header('authorization');
  if (!header?.startsWith('Bearer ')) { response.status(401).json({ code: 'UNAUTHORIZED', message: 'Authentication required' }); return; }
  try {
    const payload = verifyToken<JwtPayload>(header.slice(7));
    if (typeof payload.sub !== 'string' || typeof payload.email !== 'string') throw new Error('Invalid token payload');
    request.auth = payload;
    next();
  } catch { response.status(401).json({ code: 'INVALID_TOKEN', message: 'Token is invalid or expired' }); }
};
