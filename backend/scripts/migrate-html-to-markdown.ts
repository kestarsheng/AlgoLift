// 一次性迁移脚本：将 Note.content / Problem.internalNote / Wrong.review 由 HTML 转为 Markdown。
// 幂等：仅对仍含 HTML 标签的内容执行 turndown，已是 Markdown 的跳过。迁移前先导出 JSON 备份。
// 运行：npx tsx scripts/migrate-html-to-markdown.ts
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import TurndownService from 'turndown';
import { prisma } from '../src/config/prisma';

const turndown = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced', bulletListMarker: '-' });

const HTML_TAG = /<\/?(p|div|span|br|h[1-6]|ul|ol|li|strong|b|em|i|code|pre|blockquote|a|img|table|thead|tbody|tr|th|td|hr|sub|sup|mark|font|center|section|article)\b/i;
const looksLikeHtml = (value: string | null): value is string => Boolean(value) && HTML_TAG.test(value);

interface BackupRow { id: string; content: string | null }
const stamp = new Date().toISOString().replace(/[:.]/g, '-');

async function main(): Promise<void> {
  const notes = await prisma.note.findMany({ select: { id: true, content: true } });
  const problems = await prisma.problem.findMany({ select: { id: true, internalNote: true } });
  const wrongs = await prisma.wrong.findMany({ select: { id: true, review: true } });

  const backup = {
    exportedAt: new Date().toISOString(),
    notes: notes.map((n) => ({ id: n.id, content: n.content })),
    problems: problems.map((p) => ({ id: p.id, internalNote: p.internalNote })),
    wrongs: wrongs.map((w) => ({ id: w.id, review: w.review })),
  };
  const backupPath = path.join(__dirname, `backup-${stamp}.json`);
  fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2), 'utf8');
  console.log(`备份已写入 ${backupPath}（笔记 ${notes.length}、题目 ${problems.length}、错题 ${wrongs.length}）`);

  let noteCount = 0;
  for (const note of notes) {
    if (looksLikeHtml(note.content)) {
      await prisma.note.update({ where: { id: note.id }, data: { content: turndown.turndown(note.content) } });
      noteCount++;
    }
  }

  let problemCount = 0;
  for (const problem of problems) {
    if (looksLikeHtml(problem.internalNote)) {
      await prisma.problem.update({ where: { id: problem.id }, data: { internalNote: turndown.turndown(problem.internalNote) } });
      problemCount++;
    }
  }

  let wrongCount = 0;
  for (const wrong of wrongs) {
    if (looksLikeHtml(wrong.review)) {
      await prisma.wrong.update({ where: { id: wrong.id }, data: { review: turndown.turndown(wrong.review) } });
      wrongCount++;
    }
  }

  console.log(`迁移完成：笔记 ${noteCount} 条、题目 ${problemCount} 条、错题 ${wrongCount} 条，合计 ${noteCount + problemCount + wrongCount} 条。`);
}

main().then(() => prisma.$disconnect()).catch(async (error: unknown) => { console.error('迁移失败：', error); await prisma.$disconnect(); process.exit(1); });