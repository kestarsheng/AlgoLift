// 实现题目与题解笔记关联的事务性替换业务。
import { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { NoteIdsInput } from './problem-notes.dto';

export class ProblemNotesError extends Error {
  public constructor(public readonly code: string, message: string, public readonly statusCode: number) { super(message); }
}

export const replaceProblemNotes = async (userId: string, problemId: string, input: NoteIdsInput) => {
  try {
    return await prisma.$transaction(async (tx) => {
      const problem = await tx.problem.findFirst({ where: { id: problemId, userId }, select: { id: true } });
      if (!problem) throw new ProblemNotesError('PROBLEM_NOT_FOUND', 'Problem does not exist', 404);
      const notes = await tx.note.findMany({ where: { userId, id: { in: input.noteIds } }, select: { id: true, title: true }, orderBy: { title: 'asc' } });
      if (notes.length !== input.noteIds.length) throw new ProblemNotesError('NOTE_ACCESS_DENIED', 'One or more notes are unavailable', 403);
      await tx.problemNote.deleteMany({ where: { problemId } });
      if (input.noteIds.length) await tx.problemNote.createMany({ data: input.noteIds.map((noteId) => ({ problemId, noteId })) });
      return { data: { problemId, notes } };
    });
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') throw new ProblemNotesError('PROBLEM_NOT_FOUND', 'Problem does not exist', 404);
    throw error;
  }
};
