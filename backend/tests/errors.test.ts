import { Prisma } from '@prisma/client';
import { ApiError, parseIdParam, assertRecordExists, handlePrismaNotFound } from '../src/lib/errors';

describe('ApiError', () => {
  it('携带 statusCode、code、message 并继承 Error', () => {
    const error = new ApiError(404, 'NOTE_NOT_FOUND', 'Note does not exist');
    expect(error.statusCode).toBe(404);
    expect(error.code).toBe('NOTE_NOT_FOUND');
    expect(error.message).toBe('Note does not exist');
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ApiError);
  });
});

describe('parseIdParam', () => {
  it('返回合法的字符串参数', () => {
    const req = { params: { problemId: 'abc-123' } } as never;
    expect(parseIdParam(req, 'problemId')).toBe('abc-123');
  });
  it('默认参数名为 id', () => {
    const req = { params: { id: 'xyz' } } as never;
    expect(parseIdParam(req)).toBe('xyz');
  });
  it('缺失参数时抛 400', () => {
    const req = { params: {} } as never;
    expect(() => parseIdParam(req, 'noteId')).toThrow(ApiError);
    try { parseIdParam(req, 'noteId'); } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).statusCode).toBe(400);
      expect((error as ApiError).code).toBe('INVALID_ROUTE_PARAM');
    }
  });
  it('空字符串参数时抛 400', () => {
    const req = { params: { noteId: '' } } as never;
    expect(() => parseIdParam(req, 'noteId')).toThrow(ApiError);
    try { parseIdParam(req, 'noteId'); } catch (error) {
      expect((error as ApiError).statusCode).toBe(400);
      expect((error as ApiError).code).toBe('INVALID_ROUTE_PARAM');
    }
  });
  it('数组型参数时抛 400', () => {
    const req = { params: { noteId: ['a', 'b'] } } as never;
    expect(() => parseIdParam(req, 'noteId')).toThrow(ApiError);
    try { parseIdParam(req, 'noteId'); } catch (error) {
      expect((error as ApiError).statusCode).toBe(400);
      expect((error as ApiError).code).toBe('INVALID_ROUTE_PARAM');
    }
  });
});

describe('assertRecordExists', () => {
  it('非空记录原样返回', () => {
    const record = { id: 'x', title: 'test' };
    expect(assertRecordExists(record, 'NOTE_NOT_FOUND', 'Note does not exist')).toBe(record);
  });
  it('null 时抛 404', () => {
    expect(() => assertRecordExists(null, 'NOTE_NOT_FOUND', 'Note does not exist')).toThrow(ApiError);
    try { assertRecordExists(null, 'NOTE_NOT_FOUND', 'Note does not exist'); } catch (error) {
      expect((error as ApiError).statusCode).toBe(404);
      expect((error as ApiError).code).toBe('NOTE_NOT_FOUND');
      expect((error as ApiError).message).toBe('Note does not exist');
    }
  });
  it('undefined 时抛 404', () => {
    expect(() => assertRecordExists(undefined, 'WRONG_NOT_FOUND', 'Wrong does not exist')).toThrow(ApiError);
    try { assertRecordExists(undefined, 'WRONG_NOT_FOUND', 'Wrong does not exist'); } catch (error) {
      expect((error as ApiError).statusCode).toBe(404);
      expect((error as ApiError).code).toBe('WRONG_NOT_FOUND');
    }
  });
});

describe('handlePrismaNotFound', () => {
  it('P2025 映射为 404 ApiError', () => {
    const prismaError = new Prisma.PrismaClientKnownRequestError('An operation failed because it depends on one or more records that were required but not found.', { code: 'P2025', clientVersion: '5.22.0' });
    expect(() => handlePrismaNotFound(prismaError, 'TODO_NOT_FOUND', 'Todo does not exist')).toThrow(ApiError);
    try { handlePrismaNotFound(prismaError, 'TODO_NOT_FOUND', 'Todo does not exist'); } catch (error) {
      expect((error as ApiError).statusCode).toBe(404);
      expect((error as ApiError).code).toBe('TODO_NOT_FOUND');
      expect((error as ApiError).message).toBe('Todo does not exist');
    }
  });
  it('P2023 映射为 404 ApiError', () => {
    const prismaError = new Prisma.PrismaClientKnownRequestError('Unsupported input type', { code: 'P2023', clientVersion: '5.22.0' });
    expect(() => handlePrismaNotFound(prismaError, 'PRACTICE_RECORD_NOT_FOUND', 'Practice record does not exist')).toThrow(ApiError);
    try { handlePrismaNotFound(prismaError, 'PRACTICE_RECORD_NOT_FOUND', 'Practice record does not exist'); } catch (error) {
      expect((error as ApiError).statusCode).toBe(404);
      expect((error as ApiError).code).toBe('PRACTICE_RECORD_NOT_FOUND');
    }
  });
  it('P2002 透传不拦截', () => {
    const prismaError = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', { code: 'P2002', clientVersion: '5.22.0' });
    expect(() => handlePrismaNotFound(prismaError, 'NOTE_NOT_FOUND', 'Note does not exist')).toThrow(Prisma.PrismaClientKnownRequestError);
    try { handlePrismaNotFound(prismaError, 'NOTE_NOT_FOUND', 'Note does not exist'); } catch (error) {
      expect(error).toBe(prismaError);
      expect(error).not.toBeInstanceOf(ApiError);
    }
  });
  it('未知错误原样透传', () => {
    const unknownError = new Error('something went wrong');
    expect(() => handlePrismaNotFound(unknownError, 'NOTE_NOT_FOUND', 'Note does not exist')).toThrow(Error);
    try { handlePrismaNotFound(unknownError, 'NOTE_NOT_FOUND', 'Note does not exist'); } catch (error) {
      expect(error).toBe(unknownError);
      expect(error).not.toBeInstanceOf(ApiError);
    }
  });
});