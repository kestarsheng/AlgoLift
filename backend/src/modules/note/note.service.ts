// 实现题解笔记的查询、创建、编辑与删除业务。
import { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { NoteInput, NotePatch, NoteQuery } from './note.dto';
export class NoteError extends Error { public constructor(public readonly code: string, message: string, public readonly statusCode: number) { super(message); } }
const select = { id: true, title: true, content: true, solutionLinks: true, createdAt: true, updatedAt: true } as const;
const listSelect = { ...select, _count: { select: { problems: true, wrongs: true } } } as const;
const convert = (note: Prisma.NoteGetPayload<{ select: typeof select }>) => note;
const missing = (error: unknown): never => { if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') throw new NoteError('NOTE_NOT_FOUND', 'Note does not exist', 404); throw error; };
export const listNotes = async (userId: string, query: NoteQuery) => { const where = { userId, ...(query.keyword ? { title: { contains: query.keyword, mode: 'insensitive' as const } } : {}) }; const [total, rows] = await prisma.$transaction([prisma.note.count({ where }), prisma.note.findMany({ where, select: listSelect, orderBy: { updatedAt: 'desc' }, skip: (query.page - 1) * query.pageSize, take: query.pageSize })]); const data = rows.map(({ _count, ...note }) => ({ ...note, problemCount: _count.problems, wrongCount: _count.wrongs })); return { data, pagination: { page: query.page, pageSize: query.pageSize, total, totalPages: Math.ceil(total / query.pageSize) } }; };
export const getNote = async (userId: string, id: string) => { const row = await prisma.note.findFirst({ where: { id, userId }, select }); if (!row) throw new NoteError('NOTE_NOT_FOUND', 'Note does not exist', 404); return { data: convert(row) }; };
export const createNote = async (userId: string, input: NoteInput) => ({ data: convert(await prisma.note.create({ data: { userId, title: input.title.trim(), content: input.content, solutionLinks: input.solutionLinks as unknown as Prisma.InputJsonValue }, select })) });
export const updateNote = async (userId: string, id: string, input: NotePatch) => { try { return { data: convert(await prisma.note.update({ where: { id, userId }, data: { ...(input.title === undefined ? {} : { title: input.title.trim() }), ...(input.content === undefined ? {} : { content: input.content }), ...(input.solutionLinks === undefined ? {} : { solutionLinks: input.solutionLinks as unknown as Prisma.InputJsonValue }) }, select })) }; } catch (error: unknown) { return missing(error); } };
export const deleteNote = async (userId: string, id: string): Promise<void> => { try { await prisma.note.delete({ where: { id, userId } }); } catch (error: unknown) { missing(error); } };
