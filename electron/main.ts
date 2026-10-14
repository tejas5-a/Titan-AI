import { app, BrowserWindow, dialog, shell } from 'electron';
import path from 'path';
import http from 'http';
import { fork, ChildProcess } from 'child_process';

let mainWindow: BrowserWindow | null = null;
let serverProcess: ChildProcess | null = null;
const BACKEND_PORT = process.env.PORT || 3000;

// Poll backend health until ready
async function waitForBackend(port: number | string, timeoutMs = 20000): Promise<boolean> {
  const startTime = Date.now();
  const url = `http://127.0.0.1:${port}/api/health`;

  while (Date.now() - startTime < timeoutMs) {
    try {
      const ready = await new Promise<boolean>((resolve) => {
        const req = http.get(url, (res) => {
          resolve(res.statusCode === 200);
        });
        req.on('error', () => resolve(false));
        req.setTimeout(1000, () => {
          req.destroy();
          resolve(false);
        });
      });

      if (ready) return true;
    } catch (_) {}

    await new Promise((r) => setTimeout(r, 400));
  }
  return false;
}

// Start backend Express server
function startBackendServer(): Promise<number> {
  return new Promise((resolve, reject) => {
    const isDev = !app.isPackaged;
    const serverPath = isDev
      ? path.join(__dirname, '../server.ts')
      : path.join((process as any).resourcesPath || '', 'server.cjs');

    const env = {
      ...process.env,
      PORT: String(BACKEND_PORT),
      NODE_ENV: isDev ? 'development' : 'production',
      ELECTRON_RUN: 'true',
    };

    if (isDev) {
      // In dev mode, use tsx directly or connect to active dev server
      waitForBackend(BACKEND_PORT, 4000).then((ready) => {
        if (ready) {
          resolve(Number(BACKEND_PORT));
        } else {
          try {
            serverProcess = fork(serverPath, [], { env, execArgv: ['--import', 'tsx'] });
            waitForBackend(BACKEND_PORT).then((ok) => {
              if (ok) resolve(Number(BACKEND_PORT));
              else reject(new Error('Backend server failed to respond to health check.'));
            });
          } catch (e) {
            reject(e);
          }
        }
      });
    } else {
      // In packaged production, spawn bundled server
      try {
        const prodServerScript = path.join(__dirname, 'server.cjs');
        serverProcess = fork(prodServerScript, [], { env });
        waitForBackend(BACKEND_PORT).then((ok) => {
          if (ok) resolve(Number(BACKEND_PORT));
          else reject(new Error('TITAN AI backend failed to initialize.'));
        });
      } catch (e) {
        reject(e);
      }
    }
  });
}

function createMainWindow(port: number) {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 980,
    minHeight: 650,
    title: 'TITAN AI — The Ultimate Collective Intelligence Platform',
    backgroundColor: '#faf8f5',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
  });

  mainWindow.loadURL(`http://127.0.0.1:${port}`);

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  // Handle external links in native browser
  mainWindow.webContents.setWindowOpenHandler(({ url }: { url: string }) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// App lifecycle
app.whenReady().then(async () => {
  try {
    const port = await startBackendServer();
    createMainWindow(port);
  } catch (err: any) {
    dialog.showErrorBox(
      'TITAN AI Startup Failure',
      `Failed to launch local collective intelligence engine:\n${err.message || err}\n\nPlease verify that port ${BACKEND_PORT} is not blocked by Windows Firewall or another application.`
    );
    app.quit();
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0 && mainWindow === null) {
      createMainWindow(Number(BACKEND_PORT));
    }
  });
});

app.on('window-all-closed', () => {
  if (serverProcess) {
    serverProcess.kill();
    serverProcess = null;
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (serverProcess) {
    serverProcess.kill();
    serverProcess = null;
  }
});
