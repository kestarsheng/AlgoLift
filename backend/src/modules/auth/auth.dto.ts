// 定义认证模块的请求、响应和 JWT 载荷类型。
import { User } from '@prisma/client';

export interface RegisterDto {
  email: string;
  password: string;
  displayName?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
}

export type PublicUser = Pick<User, 'id' | 'email' | 'displayName' | 'theme'>;

export interface AuthResponse {
  user: PublicUser;
  token: string;
}

export const toPublicUser = (user: User): PublicUser => ({
  id: user.id,
  email: user.email,
  displayName: user.displayName,
  theme: user.theme
});

export const isRegisterDto = (body: unknown): body is RegisterDto => {
  if (!body || typeof body !== 'object') return false;
  const value = body as Record<string, unknown>;
  return typeof value.email === 'string' && typeof value.password === 'string'
    && (value.displayName === undefined || typeof value.displayName === 'string');
};

export const isLoginDto = (body: unknown): body is LoginDto => {
  if (!body || typeof body !== 'object') return false;
  const value = body as Record<string, unknown>;
  return typeof value.email === 'string' && typeof value.password === 'string';
};
