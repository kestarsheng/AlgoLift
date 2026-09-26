// 一键构建编排脚本：前端构建 → 后端构建 → prisma generate → electron-rebuild → electron-builder。
// 由 `npm run dist` 调用，产出到 electron/dist/。
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const root = path.join(__dirname, '..', '..');
const frontend = path.join(root, 'frontend');
const backend = path.join(root, 'backend');
const electronDir = path.join(__dirname, '..');

/** 在指定目录同步执行命令，继承 stdio。 */
function run(cmd, cwd) {
  console.log(`\n[build] ${cmd}`);
  console.log(`[build] cwd: ${cwd}`);
  execSync(cmd, { cwd, stdio: 'inherit' });
}

async function main() {
  console.log('=== AlgoLift Electron build started ===');

  // 1. 前端构建（使用 electron mode 加载 .env.electron）
  run('npx vite build --mode electron', frontend);

  // 2. 后端构建
  run('npm run build', backend);

  // 3. 生成 Prisma Client（确保 query engine binary 针对当前平台）
  run('npx prisma generate', backend);

  // 4. 确认 backend/.env 存在（打包进 extraResources 供运行时读取）
  const envPath = path.join(backend, '.env');
  if (!fs.existsSync(envPath)) {
    console.error('[build] ERROR: backend/.env not found. Backend needs DATABASE_URL and JWT_SECRET.');
    process.exit(1);
  }
  console.log('[build] backend/.env found');

  // 5. 重编译原生模块 bcrypt 针对 Electron 的 Node ABI
  console.log('\n[build] rebuilding native modules for Electron ABI');
  const { rebuild } = require('@electron/rebuild');
  const electronVersion = require('../package.json').devDependencies.electron;
  await rebuild({
    buildPath: backend,
    electronVersion,
    arch: process.arch,
    force: true,
    onlyModules: ['bcrypt'],
  });
  console.log('[build] native modules rebuilt');

  // 6. electron-builder 打包 Windows exe
  run('npx electron-builder --win', electronDir);

  console.log('\n=== Build complete ===');
  console.log('[build] Output: electron/dist/');
}

main().catch((e) => {
  console.error('\n[build] FAILED:', e.message);
  process.exit(1);
});