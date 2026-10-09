// 版本自动同步：从最新 git tag（去 v 前缀）写回 VITE_APP_VERSION 到 .env.development / .env.production。
// 用法：npm run version:sync（在 frontend/ 下）。幂等：已同步时无修改、不产生 diff。
// 背景：S20 起版本号不再硬编码，徽标由构建期 VITE_APP_VERSION 注入；本脚本消除发版后手动同步的遗漏。
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const frontendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const envFiles = ['.env.development', '.env.production'];

let tag;
try {
  const refs = execFileSync('git', ['tag', '--sort=-v:refname'], { cwd: frontendRoot, encoding: 'utf8' })
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => /^v?\d+\.\d+\.\d+$/.test(line));
  tag = refs[0];
  if (!tag) {
    console.error('[sync-version] 未找到语义化版本 tag，跳过同步（保持现有 VITE_APP_VERSION 不变）');
    process.exit(0);
  }
} catch {
  console.error('[sync-version] git tag 读取失败，跳过同步（保持现有 VITE_APP_VERSION 不变）');
  process.exit(0);
}
const version = tag.replace(/^v/, '');
if (!/^\d+\.\d+\.\d+$/.test(version)) {
  console.error(`[sync-version] tag 格式异常: ${tag}，期望 vX.Y.Z`);
  process.exit(1);
}

let changed = false;
for (const name of envFiles) {
  const file = path.join(frontendRoot, name);
  const content = existsSync(file) ? readFileSync(file, 'utf8') : '';
  const lines = content.split('\n');
  const index = lines.findIndex((line) => line.startsWith('VITE_APP_VERSION='));
  if (index >= 0) {
    if (lines[index] === `VITE_APP_VERSION=${version}`) continue;
    lines[index] = `VITE_APP_VERSION=${version}`;
  } else {
    lines.push(`VITE_APP_VERSION=${version}`);
  }
  writeFileSync(file, lines.join('\n'));
  changed = true;
  console.log(`[sync-version] ${name}: VITE_APP_VERSION -> ${version}`);
}
if (changed) {
  console.log('[sync-version] 已同步，请将两个 env 文件的改动随发版提交入库（Vercel 构建读取仓库内 env）。');
} else {
  console.log(`[sync-version] 已是最新（${version}），无改动。`);
}