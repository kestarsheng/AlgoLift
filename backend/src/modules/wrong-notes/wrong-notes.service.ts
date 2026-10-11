// 实现错题与题解笔记关联的查询、替换和解除业务。
import { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { NoteIdsInput } from './wrong-notes.dto';
import { ApiError, assertRecordExists, handlePrismaNotFound } from '../../lib/errors';

const notesSelect = { id: true, title: true } as const;

export const getWrongNotes = async (userId: string, wrongId: string) => {
  const wrong = await prisma.wrong.findFirst({ where: { id: wrongId, userId }, select: { id: true, notes: { select: { note: { select: notesSelect } }, orderBy: { note: { title: 'asc' } } } } });
  const existing = assertRecordExists(wrong, 'WRONG_NOT_FOUND', 'Wrong does not exist');
  return { data: { wrongId, notes: existing.notes.map(({ note }) => note) } };
};

export const replaceWrongNotes = async (userId: string, wrongId: string, input: NoteIdsInput) => {
  try {
    return await prisma.$transaction(async (tx) => {
      const wrong = await tx.wrong.findFirst({ where: { id: wrongId, userId }, select: { id: true } });
      assertRecordExists(wrong, 'WRONG_NOT_FOUND', 'Wrong does not exist');
      const notes = await tx.note.findMany({ where: { userId, id: { in: input.noteIds } }, select: notesSelect, orderBy: { title: 'asc' } });
      if (notes.length !== input.noteIds.length) throw new ApiError(403, 'NOTE_ACCESS_DENIED', 'One or more notes are unavailable');
      await tx.wrongNote.deleteMany({ where: { wrongId } });
      if (input.noteIds.length) await tx.wrongNote.createMany({ data: input.noteIds.map((noteId) => ({ wrongId, noteId })) });
      return { data: { wrongId, notes } };
    });
  } catch (error: unknown) {
    handlePrismaNotFound(error, 'WRONG_NOT_FOUND', 'Wrong does not exist');
  }
};

export const removeWrongNote = async (userId: string, wrongId: string, noteId: string): Promise<void> => {
  const wrongNote = await prisma.wrongNote.findFirst({ where: { wrongId, noteId, wrong: { userId } }, select: { wrongId: true } });
  if (!wrongNote) {
    const wrong = await prisma.wrong.findFirst({ where: { id: wrongId, userId }, select: { id: true } });
    assertRecordExists(wrong, 'WRONG_NOT_FOUND', 'Wrong does not exist');
    throw new ApiError(404, 'WRONG_NOTE_NOT_FOUND', 'Wrong note link does not exist');
  }
  await prisma.wrongNote.delete({ where: { wrongId_noteId: { wrongId, noteId } } });
};
