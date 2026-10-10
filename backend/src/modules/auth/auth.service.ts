// 实现用户注册、登录、密码哈希和 JWT 签发业务。
import { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { comparePassword, hashPassword, signToken } from '../../config/security';
import { AuthResponse, LoginDto, RegisterDto, toPublicUser } from './auth.dto';
import { ApiError, assertRecordExists } from '../../lib/errors';

const normalizeEmail = (email: string): string => email.trim().toLowerCase();
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const register = async (input: RegisterDto): Promise<AuthResponse> => {
  const email = normalizeEmail(input.email);
  if (!emailPattern.test(email) || input.password.length < 8 || input.password.length > 72) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Email or password format is invalid');
  }

  try {
    const user = await prisma.user.create({
      data: { email, passwordHash: await hashPassword(input.password), displayName: input.displayName?.trim() || null }
    });
    return { user: toPublicUser(user), token: signToken({ sub: user.id, email: user.email }, { expiresIn: '7d' }) };
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new ApiError(409, 'EMAIL_ALREADY_EXISTS', 'Email is already registered');
    }
    throw error;
  }
};

export const login = async (input: LoginDto): Promise<AuthResponse> => {
  const user = await prisma.user.findUnique({ where: { email: normalizeEmail(input.email) } });
  if (!user || !(await comparePassword(input.password, user.passwordHash))) {
    throw new ApiError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect');
  }
  return { user: toPublicUser(user), token: signToken({ sub: user.id, email: user.email }, { expiresIn: '7d' }) };
};

export const getUser = async (id: string) => {
  const user = await prisma.user.findUnique({ where: { id } });
  return toPublicUser(assertRecordExists(user, 'USER_NOT_FOUND', 'User does not exist'));
};
