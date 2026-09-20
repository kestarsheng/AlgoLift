// 实现用户注册、登录、密码哈希和 JWT 签发业务。
import { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { comparePassword, hashPassword, signToken } from '../../config/security';
import { AuthResponse, LoginDto, RegisterDto, toPublicUser } from './auth.dto';

export class AuthError extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  public constructor(code: string, message: string, statusCode: number) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
  }
}

const normalizeEmail = (email: string): string => email.trim().toLowerCase();
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const register = async (input: RegisterDto): Promise<AuthResponse> => {
  const email = normalizeEmail(input.email);
  if (!emailPattern.test(email) || input.password.length < 8 || input.password.length > 72) {
    throw new AuthError('VALIDATION_ERROR', 'Email or password format is invalid', 400);
  }

  try {
    const user = await prisma.user.create({
      data: { email, passwordHash: await hashPassword(input.password), displayName: input.displayName?.trim() || null }
    });
    return { user: toPublicUser(user), token: signToken({ sub: user.id, email: user.email }, { expiresIn: '7d' }) };
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new AuthError('EMAIL_ALREADY_EXISTS', 'Email is already registered', 409);
    }
    throw error;
  }
};

export const login = async (input: LoginDto): Promise<AuthResponse> => {
  const user = await prisma.user.findUnique({ where: { email: normalizeEmail(input.email) } });
  if (!user || !(await comparePassword(input.password, user.passwordHash))) {
    throw new AuthError('INVALID_CREDENTIALS', 'Email or password is incorrect', 401);
  }
  return { user: toPublicUser(user), token: signToken({ sub: user.id, email: user.email }, { expiresIn: '7d' }) };
};

export const getUser = async (id: string) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new AuthError('USER_NOT_FOUND', 'User does not exist', 404);
  return toPublicUser(user);
};
