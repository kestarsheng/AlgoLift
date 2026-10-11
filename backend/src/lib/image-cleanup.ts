// 上传图片清理：解析文本字段中的 /uploads/<filename> 引用，提供级联清理与定时孤儿清理。
import fs from 'fs';
import path from 'path';
import { prisma } from '../config/prisma';

export const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
const IMAGE_REF_PATTERN = /\/uploads\/([0-9]+-[a-z0-9]+\.(?:jpe?g|png|gif|webp))/g;
const SAFE_NAME_PATTERN = /^[0-9]+-[a-z0-9]+\.(?:jpe?g|png|gif|webp)$/;

export interface CleanupResult { removed: string[]; failed: string[]; skipped: string[] }

// 文件名必须匹配上传模块生成规则 <timestamp>-<random>.<ext>，仅限此格式方可删除，防止路径穿越。
export const isSafeUploadName = (filename: string): boolean => SAFE_NAME_PATTERN.test(filename);

export const parseImageRefs = (text: string | null | undefined): Set<string> => {
  const refs = new Set<string>();
  if (!text) return refs;
  for (const match of text.matchAll(IMAGE_REF_PATTERN)) {
    if (isSafeUploadName(match[1])) refs.add(match[1]);
  }
  return refs;
};

const isImageReferenced = async (filename: string): Promise<boolean> => {
  const needle = `/uploads/${filename}`;
  const [note, problem, wrong, progress] = await Promise.all([
    prisma.note.findFirst({ where: { content: { contains: needle } }, select: { id: true } }),
    prisma.problem.findFirst({ where: { internalNote: { contains: needle } }, select: { id: true } }),
    prisma.wrong.findFirst({ where: { review: { contains: needle } }, select: { id: true } }),
    prisma.progress.findFirst({ where: { description: { contains: needle } }, select: { id: true } }),
  ]);
  return Boolean(note || problem || wrong || progress);
};

export const collectAllReferencedImages = async (): Promise<Set<string>> => {
  const refs = new Set<string>();
  const notes = await prisma.note.findMany({ where: { content: { contains: '/uploads/' } }, select: { content: true } });
  for (const { content } of notes) for (const file of parseImageRefs(content)) refs.add(file);
  const problems = await prisma.problem.findMany({ where: { internalNote: { contains: '/uploads/' } }, select: { internalNote: true } });
  for (const { internalNote } of problems) for (const file of parseImageRefs(internalNote)) refs.add(file);
  const wrongs = await prisma.wrong.findMany({ where: { review: { contains: '/uploads/' } }, select: { review: true } });
  for (const { review } of wrongs) for (const file of parseImageRefs(review)) refs.add(file);
  const progresses = await prisma.progress.findMany({ where: { description: { contains: '/uploads/' } }, select: { description: true } });
  for (const { description } of progresses) for (const file of parseImageRefs(description)) refs.add(file);
  return refs;
};

// 级联清理：实体已从 DB 删除后调用，仅删除不再被任何实体引用的图片文件。
export const cleanupDeletedEntityImages = async (text: string | null | undefined): Promise<CleanupResult> => {
  const result: CleanupResult = { removed: [], failed: [], skipped: [] };
  for (const filename of parseImageRefs(text)) {
    if (!isSafeUploadName(filename)) { result.skipped.push(filename); continue; }
    if (await isImageReferenced(filename)) { result.skipped.push(filename); continue; }
    try {
      fs.unlinkSync(path.join(UPLOAD_DIR, filename));
      result.removed.push(filename);
    } catch (error: unknown) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') result.skipped.push(filename);
      else result.failed.push(filename);
    }
  }
  return result;
};

// 定时清理：删除不被任何实体引用且超过宽限期（graceMs）的孤儿图片。
export const cleanupOrphanedImages = async (graceMs: number): Promise<CleanupResult> => {
  const result: CleanupResult = { removed: [], failed: [], skipped: [] };
  const referenced = await collectAllReferencedImages();
  let files: string[];
  try { files = fs.readdirSync(UPLOAD_DIR); } catch { return result; }
  const now = Date.now();
  for (const filename of files) {
    if (!isSafeUploadName(filename) || referenced.has(filename)) { result.skipped.push(filename); continue; }
    const filePath = path.join(UPLOAD_DIR, filename);
    let stat;
    try { stat = fs.statSync(filePath); } catch { result.skipped.push(filename); continue; }
    if (now - stat.mtimeMs < graceMs) { result.skipped.push(filename); continue; }
    try {
      fs.unlinkSync(filePath);
      result.removed.push(filename);
    } catch (error: unknown) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') result.failed.push(filename);
    }
  }
  return result;
};

const DEFAULT_GRACE_MS = 24 * 60 * 60 * 1000;
const DEFAULT_INTERVAL_MS = 24 * 60 * 60 * 1000;

const logResult = (tag: string, result: CleanupResult): void => {
  console.log(`[image-cleanup] ${tag} removed=${result.removed.length} failed=${result.failed.length} skipped=${result.skipped.length}${result.removed.length ? ` files=${result.removed.join(',')}` : ''}`);
};

export const runScheduledCleanup = async (): Promise<void> => {
  const graceMs = Number(process.env.IMAGE_CLEANUP_GRACE_MS ?? DEFAULT_GRACE_MS);
  logResult('orphan-scan', await cleanupOrphanedImages(graceMs));
};

// 启动定时清理任务；IMAGE_CLEANUP_ENABLED='false' 时禁用，周期/宽限期可用环境变量覆盖。
export const startImageCleanupScheduler = (): NodeJS.Timeout | null => {
  if (process.env.IMAGE_CLEANUP_ENABLED === 'false') return null;
  const intervalMs = Number(process.env.IMAGE_CLEANUP_INTERVAL_MS ?? DEFAULT_INTERVAL_MS);
  const timer = setInterval(() => {
    runScheduledCleanup().catch((error: unknown) => console.error('[image-cleanup] scan error:', error));
  }, intervalMs);
  timer.unref();
  return timer;
};