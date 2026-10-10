// 实现题目与题解笔记关联的事务性替换业务。
import { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { NoteIdsInput } from './problem-notes.dto';
import { ApiError, assertRecordExists, handlePrismaNotFound } from '../../lib/errors';

export const replaceProblemNotes = async (userId: string, problemId: string, input: NoteIdsInput) => {
  try {
    return await prisma.$transaction(async (tx) => {
      const problem = await tx.problem.findFirst({ where: { id: problemId, userId }, select: { id: true } });
      assertRecordExists(problem, 'PROBLEM_NOT_FOUND', 'Problem does not exist');
      const notes = await tx.note.findMany({ where: { userId, id: { in: input.noteIds } }, select: { id: true, title: true }, orderBy: { title: 'asc' } });
      if (notes.length !== input.noteIds.length) throw new ApiError(403, 'NOTE_ACCESS_DENIED', 'One or more notes are unavailable');
      await tx.problemNote.deleteMany({ where: { problemId } });
      if (input.noteIds.length) await tx.problemNote.createMany({ data: input.noteIds.map((noteId) => ({ problemId, noteId })) });
      return { data: { problemId, notes } };
    });
  } catch (error: unknown) {
    handlePrismaNotFound(error, 'PROBLEM_NOT_FOUND', 'Problem does not exist');
  }
};
