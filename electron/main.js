// Electron 主进程：启动后端子进程、注册自定义协议加载前端、管理窗口生命周期。
const { app, BrowserWindow, protocol, net } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const http = require('http');
const { pathToFileURL } = require('url');

// 在最早期把 console.log/error 同时写入 main.log 文件，便于 GUI 模式下诊断启动问题。
(function setupMainLog() {
  try {
    const logsDir = app.getPath('logs');
    if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });
    const mainLog = path.join(logsDir, 'main.log');
    const stream = fs.createWriteStream(mainLog, { flags: 'a' });
    stream.write(`\n=== [${new Date().toISOString()}] Electron main start ===\n`);
    const origLog = console.log;
    const origErr = console.error;
    console.log = (...args) => { origLog(...args); try { stream.write(args.map(String).join(' ') + '\n'); } catch (_) {} };
    console.error = (...args) => { origErr(...args); try { stream.write(args.map(String).join(' ') + '\n'); } catch (_) {} };
  } catch (e) {
    // 若日志重定向失败也不阻塞启动。
  }
})();

// 单实例锁：若已有实例运行，立即退出当前实例；主实例收到 second-instance 时聚焦已有窗口。
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  console.log('[electron] another instance is already running, quitting this one');
  app.quit();
  process.exit(0);
}
app.on('second-instance', () => {
  console.log('[electron] second instance attempted; focusing existing window');
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    if (!mainWindow.isVisible()) mainWindow.show();
    mainWindow.focus();
  }
});

// 注册自定义协议 app://，必须在 app ready 之前调用。
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true } },
]);

const BACKEND_PORT = 3000;
const BACKEND_READY_TIMEOUT_MS = 30000;
const MAX_STDERR_BUFFER = 64 * 1024;

let backendProcess = null;
let mainWindow = null;
// 收集后端 stderr，用于启动失败时在窗口里展示诊断信息。
let backendStderrBuffer = '';

/** 返回前端 dist 与后端目录的路径（区分开发与打包环境）。 */
function getPaths() {
  const base = app.isPackaged ? process.resourcesPath : path.join(__dirname, '..');
  return {
    frontendDist: path.join(base, 'frontend', 'dist'),
    backendDir: path.join(base, 'backend'),
    backendEntry: path.join(base, 'backend', 'dist', 'src', 'app.js'),
  };
}

/** 解析 .env 文件为 key-value 对象（不引入 dotenv 依赖）。 */
function parseEnvFile(filePath) {
  const result = {};
  if (!fs.existsSync(filePath)) return result;
  const content = fs.readFileSync(filePath, 'utf-8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    result[key] = value;
  }
  return result;
}

/** 组装后端子进程环境变量：electron/.env 覆盖 backend/.env，再回退到 process.env。 */
function getBackendEnv(paths) {
  const electronEnv = parseEnvFile(path.join(__dirname, '.env'));
  const backendEnv = parseEnvFile(path.join(paths.backendDir, '.env'));
  const merged = { ...backendEnv, ...electronEnv };
  return {
    ...process.env,
    ELECTRON_RUN_AS_NODE: '1',
    DATABASE_URL: merged.DATABASE_URL || process.env.DATABASE_URL,
    JWT_SECRET: merged.JWT_SECRET || process.env.JWT_SECRET,
    PORT: String(BACKEND_PORT),
    FRONTEND_URL: `http://localhost:${BACKEND_PORT}`,
  };
}

/** 确保日志目录存在并返回 backend.log 路径。 */
function getBackendLogPath() {
  const logsDir = app.getPath('logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
  return path.join(logsDir, 'backend.log');
}

/** 把字符串追加到 stderr 缓冲（截断到尾部 MAX_STDERR_BUFFER，避免无限增长）。 */
function appendStderr(s) {
  backendStderrBuffer += s;
  if (backendStderrBuffer.length > MAX_STDERR_BUFFER) {
    backendStderrBuffer = backendStderrBuffer.slice(-MAX_STDERR_BUFFER);
  }
}

/**
 * 启动后端子进程（用 Electron 自带 Node 以 ELECTRON_RUN_AS_NODE 模式运行），转发输出到日志。
 * 开头输出诊断日志（app.isPackaged、所有路径、execPath、入口是否存在），并监听 spawn 的 error 事件。
 * 返回 true 表示 spawn 已发出，false 表示前置检查失败未启动。
 */
function startBackend(paths) {
  // 诊断日志：确认 startBackend 被调用，并打印所有关键路径与运行环境。
  console.log('[electron] === startBackend called ===');
  console.log('[electron] app.isPackaged =', app.isPackaged);
  console.log('[electron] process.execPath =', process.execPath);
  console.log('[electron] process.platform =', process.platform);
  console.log('[electron] process.arch =', process.arch);
  console.log('[electron] __dirname =', __dirname);
  console.log('[electron] process.resourcesPath =', process.resourcesPath);
  console.log('[electron] paths =', JSON.stringify(paths, null, 2));
  console.log('[electron] app.getPath("logs") =', app.getPath('logs'));
  console.log('[electron] app.getPath("userData") =', app.getPath('userData'));

  const env = getBackendEnv(paths);
  console.log('[electron] env.DATABASE_URL set =', !!env.DATABASE_URL);
  console.log('[electron] env.JWT_SECRET set =', !!env.JWT_SECRET);
  console.log('[electron] env.ELECTRON_RUN_AS_NODE =', env.ELECTRON_RUN_AS_NODE);
  console.log('[electron] env.PORT =', env.PORT);

  if (!env.DATABASE_URL) {
    const msg = '[electron] WARNING: DATABASE_URL not set, backend will fail to start';
    console.error(msg);
    appendStderr(msg + '\n');
  }

  // 检查入口文件存在，避免 spawn 后 ENOENT 无 error handler 导致崩溃。
  if (!fs.existsSync(paths.backendEntry)) {
    const msg = `[electron] backend entry NOT FOUND: ${paths.backendEntry}`;
    console.error(msg);
    appendStderr(msg + '\n');
    return false;
  }
  console.log('[electron] backend entry exists:', paths.backendEntry);

  if (!fs.existsSync(paths.backendDir)) {
    const msg = `[electron] backend dir NOT FOUND: ${paths.backendDir}`;
    console.error(msg);
    appendStderr(msg + '\n');
    return false;
  }
  console.log('[electron] backend dir exists:', paths.backendDir);

  const logFile = getBackendLogPath();
  console.log('[electron] backend log file:', logFile);
  const logStream = fs.createWriteStream(logFile, { flags: 'a' });
  logStream.write(`\n=== [${new Date().toISOString()}] startBackend ===\n`);
  logStream.write(`execPath=${process.execPath}\nentry=${paths.backendEntry}\ncwd=${paths.backendDir}\n`);

  try {
    backendProcess = spawn(process.execPath, [paths.backendEntry], {
      cwd: paths.backendDir,
      env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch (e) {
    const msg = `[electron] spawn threw synchronously: ${e && e.message ? e.message : e}`;
    console.error(msg);
    logStream.write(msg + '\n');
    appendStderr(msg + '\n');
    return false;
  }

  console.log('[electron] backend spawned, pid =', backendProcess.pid);

  backendProcess.stdout.on('data', (d) => {
    const s = d.toString();
    console.log(`[backend] ${s.trim()}`);
    logStream.write(s);
  });
  backendProcess.stderr.on('data', (d) => {
    const s = d.toString();
    console.error(`[backend] ${s.trim()}`);
    logStream.write(s);
    appendStderr(s);
  });
  // 必须监听 error 事件，否则 spawn 失败（ENOENT/EPERM）会触发 uncaught exception 导致 Electron 崩溃。
  backendProcess.on('error', (e) => {
    const msg = `[electron] backend spawn error: ${e && e.message ? e.message : e} (code=${e && e.code})`;
    console.error(msg);
    logStream.write(msg + '\n');
    appendStderr(msg + '\n');
    backendProcess = null;
  });
  backendProcess.on('exit', (code, signal) => {
    const msg = `[backend] process exited with code=${code} signal=${signal}`;
    console.log(msg);
    logStream.write(msg + '\n');
    backendProcess = null;
  });

  return true;
}

/** 轮询后端健康检查端点，直到返回 {"status":"ok"} 或超时。 */
function waitForBackend(port, timeout = BACKEND_READY_TIMEOUT_MS) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const check = () => {
      const req = http.get(`http://localhost:${port}/api/health`, (res) => {
        let body = '';
        res.on('data', (chunk) => { body += chunk; });
        res.on('end', () => {
          const ok = res.statusCode === 200 && body.includes('"ok"');
          if (ok) {
            resolve();
          } else if (Date.now() - start > timeout) {
            reject(new Error(`health check timeout (status ${res.statusCode}, body ${body.slice(0, 200)})`));
          } else {
            setTimeout(check, 500);
          }
        });
      });
      req.on('error', () => {
        if (Date.now() - start > timeout) {
          reject(new Error('health check timeout (connection refused)'));
        } else {
          setTimeout(check, 500);
        }
      });
    };
    check();
  });
}

/** 杀掉后端子进程（Windows 用 taskkill 级联终止子进程树）。 */
function killBackend() {
  if (!backendProcess) return;
  try {
    if (process.platform === 'win32') {
      spawn('taskkill', ['/T', '/F', '/PID', String(backendProcess.pid)]);
    } else {
      process.kill(-backendProcess.pid);
    }
  } catch (e) {
    console.error('[electron] failed to kill backend:', e.message);
  }
  backendProcess = null;
}

/** 创建主窗口（不加载任何页面，由调用方决定加载内容）。 */
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    title: 'AlgoLift',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools();
  }
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
  return mainWindow;
}

/** 加载前端页面（app:// 协议）。 */
function loadFrontend() {
  if (!mainWindow) return;
  mainWindow.loadURL('app://localhost/index.html');
}

/** 在窗口里显示「启动中」占位页，避免后端就绪前白屏。 */
function loadLoadingPage() {
  if (!mainWindow) return;
  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<title>AlgoLift 启动中</title>
<style>
  body { margin: 0; padding: 0; height: 100vh; display: flex; align-items: center; justify-content: center; font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; background: #FDF8F6; color: #2D2A2A; }
  .box { text-align: center; }
  .spinner { width: 32px; height: 32px; border: 3px solid #F2E4E7; border-top-color: #B85C6E; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 16px; }
  @keyframes spin { to { transform: rotate(360deg); } }
  p { margin: 0; font-size: 14px; color: #8C6B4E; }
</style>
</head>
<body>
  <div class="box">
    <div class="spinner"></div>
    <p>正在启动 AlgoLift…</p>
  </div>
</body>
</html>`;
  mainWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html));
}

/** 在窗口里显示后端启动失败的错误页（含 stderr 日志），便于用户诊断。 */
function loadErrorPage(title, detail) {
  if (!mainWindow) return;
  const safe = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  const stderr = safe(backendStderrBuffer || '(no stderr captured)');
  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<title>AlgoLift 启动失败</title>
<style>
  body { margin: 0; padding: 32px; font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; background: #FDF8F6; color: #2D2A2A; }
  h1 { font-size: 22px; margin: 0 0 8px; color: #B85C6E; }
  p { margin: 0 0 16px; line-height: 1.6; }
  pre { background: #2D2A2A; color: #FDF8F6; padding: 16px; border-radius: 4px; overflow: auto; max-height: 55vh; font-size: 12px; line-height: 1.5; white-space: pre-wrap; word-break: break-all; }
  .detail { background: #F2E4E7; padding: 12px 16px; border-radius: 4px; margin-bottom: 16px; font-size: 13px; line-height: 1.6; }
  .hint { font-size: 12px; color: #8C6B4E; margin-top: 16px; }
</style>
</head>
<body>
  <h1>AlgoLift 启动失败</h1>
  <p>后端服务未能正常启动，无法加载应用界面。请将以下错误信息反馈给开发者。</p>
  <div class="detail"><strong>${safe(title)}</strong><br>${safe(detail)}</div>
  <p><strong>后端日志（stderr）：</strong></p>
  <pre>${stderr}</pre>
  <p class="hint">日志文件位置：${safe(getBackendLogPath())}</p>
</body>
</html>`;
  mainWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html));
}

app.whenReady().then(async () => {
  console.log('[electron] app.whenReady fired');
  const paths = getPaths();
  console.log('[electron] paths resolved:', JSON.stringify(paths, null, 2));

  // 注册 app:// 协议 handler：把请求映射到 frontend/dist，找不到的路径回退到 index.html（SPA）。
  protocol.handle('app', (request) => {
    const url = new URL(request.url);
    let pathname = decodeURIComponent(url.pathname);
    if (pathname === '/' || pathname === '') pathname = '/index.html';
    const filePath = path.join(paths.frontendDist, pathname);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      return net.fetch(pathToFileURL(filePath).toString());
    }
    return net.fetch(pathToFileURL(path.join(paths.frontendDist, 'index.html')).toString());
  });

  // 先建窗口并显示「启动中」占位页，避免后端就绪前白屏。
  createWindow();
  loadLoadingPage();

  // 启动后端子进程。
  const started = startBackend(paths);
  if (!started) {
    loadErrorPage('后端进程未启动', 'startBackend 前置检查失败（入口文件或目录不存在），详见下方日志。');
    return;
  }

  // 等待后端健康检查通过，再加载前端；超时则显示错误页。
  try {
    await waitForBackend(BACKEND_PORT);
    console.log('[electron] backend ready, loading frontend');
    loadFrontend();
  } catch (e) {
    console.error('[electron] backend failed to start:', e.message);
    loadErrorPage('后端健康检查超时', `${e.message}（已等待 ${BACKEND_READY_TIMEOUT_MS / 1000}s）`);
  }
});

app.on('before-quit', killBackend);
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
    loadFrontend();
  }
});
