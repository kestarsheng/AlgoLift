// 提供 JWT 和 bcrypt 的基础配置入口，业务认证逻辑留待后续模块实现。
import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from './env';

export const hashPassword = (password: string): Promise<string> => bcrypt.hash(password, 12);

export const comparePassword = (password: string, hash: string): Promise<boolean> =>
  bcrypt.compare(password, hash);

export const signToken = (payload: object, options?: SignOptions): string =>
  jwt.sign(payload, config.jwtSecret, options);

export const verifyToken = <T extends object>(token: string): T =>
  jwt.verify(token, config.jwtSecret) as T;
