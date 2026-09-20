// 实现错题与题解笔记关联的查询、替换和解除业务。
import { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { NoteIdsInput } from './wrong-notes.dto';

export class WrongNotesError extends Error {
  public constructor(public readonly code: string, message: string, public readonly statusCode: number) { super(message); }
}

const notesSelect = { id: true, title: true } as const;

export const getWrongNotes = async (userId: string, wrongId: string) => {
  const wrong = await prisma.wrong.findFirst({ where: { id: wrongId, userId }, select: { id: true, notes: { select: { note: { select: notesSelect } }, orderBy: { note: { title: 'asc' } } } } });
  if (!wrong) throw new WrongNotesError('WRONG_NOT_FOUND', 'Wrong does not exist', 404);
  return { data: { wrongId, notes: wrong.notes.map(({ note }) => note) } };
};

export const replaceWrongNotes = async (userId: string, wrongId: string, input: NoteIdsInput) => {
  try {
    return await prisma.$transaction(async (tx) => {
      const wrong = await tx.wrong.findFirst({ where: { id: wrongId, userId }, select: { id: true } });
      if (!wrong) throw new WrongNotesError('WRONG_NOT_FOUND', 'Wrong does not exist', 404);
      const notes = await tx.note.findMany({ where: { userId, id: { in: input.noteIds } }, select: notesSelect, orderBy: { title: 'asc' } });
      if (notes.length !== input.noteIds.length) throw new WrongNotesError('NOTE_ACCESS_DENIED', 'One or more notes are unavailable', 403);
      await tx.wrongNote.deleteMany({ where: { wrongId } });
      if (input.noteIds.length) await tx.wrongNote.createMany({ data: input.noteIds.map((noteId) => ({ wrongId, noteId })) });
      return { data: { wrongId, notes } };
    });
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') throw new WrongNotesError('WRONG_NOT_FOUND', 'Wrong does not exist', 404);
    throw error;
  }
};

export const removeWrongNote = async (userId: string, wrongId: string, noteId: string): Promise<void> => {
  const wrongNote = await prisma.wrongNote.findFirst({ where: { wrongId, noteId, wrong: { userId } }, select: { wrongId: true } });
  if (!wrongNote) {
    const wrong = await prisma.wrong.findFirst({ where: { id: wrongId, userId }, select: { id: true } });
    if (!wrong) throw new WrongNotesError('WRONG_NOT_FOUND', 'Wrong does not exist', 404);
    throw new WrongNotesError('WRONG_NOTE_NOT_FOUND', 'Wrong note link does not exist', 404);
  }
  await prisma.wrongNote.delete({ where: { wrongId_noteId: { wrongId, noteId } } });
};
