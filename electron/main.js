// Electron 主进程：启动后端子进程、注册自定义协议加载前端、管理窗口生命周期。
const { app, BrowserWindow, protocol, net } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const http = require('http');
const { pathToFileURL } = require('url');

// 注册自定义协议 app://，必须在 app ready 之前调用。
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true } },
]);

const BACKEND_PORT = 3000;
let backendProcess = null;
let mainWindow = null;

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

/** 启动后端子进程（用 Electron 自带 Node 以 ELECTRON_RUN_AS_NODE 模式运行），转发输出到日志。 */
function startBackend(paths) {
  const env = getBackendEnv(paths);
  if (!env.DATABASE_URL) {
    console.error('[electron] WARNING: DATABASE_URL not set, backend will fail to start');
  }
  backendProcess = spawn(process.execPath, [paths.backendEntry], {
    cwd: paths.backendDir,
    env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const logFile = path.join(app.getPath('logs'), 'backend.log');
  const logStream = fs.createWriteStream(logFile, { flags: 'a' });
  backendProcess.stdout.on('data', (d) => {
    const s = d.toString();
    console.log(`[backend] ${s.trim()}`);
    logStream.write(s);
  });
  backendProcess.stderr.on('data', (d) => {
    const s = d.toString();
    console.error(`[backend] ${s.trim()}`);
    logStream.write(s);
  });
  backendProcess.on('exit', (code) => {
    console.log(`[backend] process exited with code ${code}`);
    backendProcess = null;
  });
}

/** 轮询后端健康检查端点，直到 200 或超时。 */
function waitForBackend(port, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const check = () => {
      const req = http.get(`http://localhost:${port}/api/health`, (res) => {
        res.resume();
        if (res.statusCode === 200) {
          resolve();
        } else if (Date.now() - start > timeout) {
          reject(new Error(`backend health check timeout (status ${res.statusCode})`));
        } else {
          setTimeout(check, 500);
        }
      });
      req.on('error', () => {
        if (Date.now() - start > timeout) {
          reject(new Error('backend health check timeout (connection refused)'));
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

/** 创建主窗口并加载前端。 */
function createWindow(paths) {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    title: 'AlgoLift',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  mainWindow.loadURL('app://localhost/index.html');
  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools();
  }
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  const paths = getPaths();

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

  startBackend(paths);

  try {
    await waitForBackend(BACKEND_PORT);
    console.log('[electron] backend ready');
  } catch (e) {
    console.error('[electron] backend failed to start:', e.message);
  }

  createWindow(paths);
});

app.on('before-quit', killBackend);
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow(getPaths());
  }
});