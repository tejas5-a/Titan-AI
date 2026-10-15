import { app, BrowserWindow, dialog, shell } from 'electron';
import path from 'path';
import http from 'http';
import net from 'net';
import fs from 'fs';
import { fork, ChildProcess } from 'child_process';

let mainWindow: BrowserWindow | null = null;
let serverProcess: ChildProcess | null = null;
const DEFAULT_PORT = process.env.PORT || 3000;

// Find an available port starting from startPort
function findAvailablePort(startPort: number): Promise<number> {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(startPort, '127.0.0.1', () => {
      const port = (server.address() as net.AddressInfo).port;
      server.close(() => resolve(port));
    });
    server.on('error', () => {
      resolve(findAvailablePort(startPort + 1));
    });
  });
}

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
  return new Promise(async (resolve, reject) => {
    const isDev = !app.isPackaged;
    const requestedPort = parseInt(String(DEFAULT_PORT), 10) || 3000;
    const targetPort = await findAvailablePort(requestedPort);

    let serverScript = isDev
      ? path.join(__dirname, '../server.ts')
      : path.join(__dirname, 'server.cjs');

    if (!isDev) {
      const possiblePaths = [
        path.join(__dirname, 'server.cjs'),
        path.join(__dirname, '../dist-electron/server.cjs'),
        path.join((process as any).resourcesPath || '', 'app.asar/dist-electron/server.cjs'),
        path.join((process as any).resourcesPath || '', 'app/dist-electron/server.cjs'),
      ];
      for (const p of possiblePaths) {
        if (p && fs.existsSync(p)) {
          serverScript = p;
          break;
        }
      }
    }

    const env = {
      ...process.env,
      PORT: String(targetPort),
      NODE_ENV: isDev ? 'development' : 'production',
      ELECTRON_RUN: 'true',
      ELECTRON_RUN_AS_NODE: '1',
    };

    if (isDev) {
      // In dev mode, check if server is already running or fork with tsx
      const ready = await waitForBackend(targetPort, 2000);
      if (ready) {
        resolve(targetPort);
        return;
      }

      try {
        serverProcess = fork(serverScript, [], {
          env: { ...env, ELECTRON_RUN_AS_NODE: undefined },
          execArgv: ['--import', 'tsx'],
        });
        const ok = await waitForBackend(targetPort);
        if (ok) resolve(targetPort);
        else reject(new Error(`Backend server failed to respond on port ${targetPort}.`));
      } catch (e) {
        reject(e);
      }
    } else {
      // In packaged production, spawn bundled server script using ELECTRON_RUN_AS_NODE
      try {
        let processOutput = '';
        serverProcess = fork(serverScript, [], {
          env,
          stdio: ['ignore', 'pipe', 'pipe', 'ipc'],
        });

        serverProcess.stdout?.on('data', (data) => {
          processOutput += data.toString();
        });

        serverProcess.stderr?.on('data', (data) => {
          processOutput += data.toString();
        });

        let hasExited = false;
        serverProcess.on('exit', (code, signal) => {
          hasExited = true;
          if (!serverProcess) return;
          reject(
            new Error(
              `Backend server process exited prematurely with code ${code} (signal: ${signal}).\nLogs: ${processOutput || 'None'}`
            )
          );
        });

        serverProcess.on('error', (err) => {
          hasExited = true;
          reject(err);
        });

        const ok = await waitForBackend(targetPort);
        if (ok) {
          if (!hasExited) resolve(targetPort);
        } else {
          if (!hasExited) {
            reject(
              new Error(
                `Backend server failed to respond on port ${targetPort} within timeout.\nLog output: ${processOutput || 'None'}`
              )
            );
          }
        }
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

let activePort = parseInt(String(DEFAULT_PORT), 10) || 3000;

// App lifecycle
app.whenReady().then(async () => {
  try {
    activePort = await startBackendServer();
    createMainWindow(activePort);
  } catch (err: any) {
    dialog.showErrorBox(
      'TITAN AI Startup Failure',
      `Failed to launch local collective intelligence engine:\n${err.message || err}\n\nPlease verify that port ${activePort} is not blocked by Windows Firewall or another application.`
    );
    app.quit();
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0 && mainWindow === null) {
      createMainWindow(activePort);
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
