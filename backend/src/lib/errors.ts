import { Prisma } from '@prisma/client';
import { Request } from 'express';

export class ApiError extends Error {
  public constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

export const parseIdParam = (req: Request, paramName = 'id'): string => {
  const value = req.params[paramName];
  if (!value || Array.isArray(value)) throw new ApiError(400, 'INVALID_ROUTE_PARAM', 'Invalid route parameter');
  return value;
};

export const assertRecordExists = <T>(record: T | null | undefined, code: string, message: string): T => {
  if (record === null || record === undefined) throw new ApiError(404, code, message);
  return record;
};

export const handlePrismaNotFound = (error: unknown, code: string, message: string): never => {
  if (error instanceof Prisma.PrismaClientKnownRequestError && (error.code === 'P2025' || error.code === 'P2023')) {
    throw new ApiError(404, code, message);
  }
  throw error;
};