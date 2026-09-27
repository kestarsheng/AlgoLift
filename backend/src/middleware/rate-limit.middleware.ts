// 认证接口 IP 速率限制：防暴力破解与垃圾注册，测试环境（Jest NODE_ENV=test）自动跳过。
import rateLimit from 'express-rate-limit';
import type { RequestHandler, Request, Response } from 'express';

const jsonHandler: RequestHandler = (_req, res) => {
  res.status(429).json({ code: 'RATE_LIMITED', message: '请求过于频繁，请稍后再试' });
};

const skipInTest = (): boolean => process.env.NODE_ENV === 'test';

export interface RateLimiterOptions {
  windowMs: number;
  limit: number;
  skip?: () => boolean;
}

/** 创建带统一 429 JSON 响应的限流中间件，用于登录/注册等认证类接口。 */
export const createRateLimiter = (options: RateLimiterOptions): RequestHandler => rateLimit({
  windowMs: options.windowMs,
  limit: options.limit,
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonHandler,
  skip: options.skip ?? skipInTest,
});

// 登录：15 分钟窗口内同一 IP 最多 20 次，超出返回 429。
export const loginRateLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, limit: 20 });

// 注册：1 小时窗口内同一 IP 最多 10 次，超出返回 429。
export const registerRateLimiter = createRateLimiter({ windowMs: 60 * 60 * 1000, limit: 10 });