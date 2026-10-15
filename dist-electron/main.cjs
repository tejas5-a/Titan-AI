var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// electron/main.ts
var import_electron = require("electron");
var import_path = __toESM(require("path"), 1);
var import_http = __toESM(require("http"), 1);
var import_net = __toESM(require("net"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_child_process = require("child_process");
var mainWindow = null;
var serverProcess = null;
var DEFAULT_PORT = process.env.PORT || 3e3;
function findAvailablePort(startPort) {
  return new Promise((resolve) => {
    const server = import_net.default.createServer();
    server.listen(startPort, "127.0.0.1", () => {
      const port = server.address().port;
      server.close(() => resolve(port));
    });
    server.on("error", () => {
      resolve(findAvailablePort(startPort + 1));
    });
  });
}
async function waitForBackend(port, timeoutMs = 2e4) {
  const startTime = Date.now();
  const url = `http://127.0.0.1:${port}/api/health`;
  while (Date.now() - startTime < timeoutMs) {
    try {
      const ready = await new Promise((resolve) => {
        const req = import_http.default.get(url, (res) => {
          resolve(res.statusCode === 200);
        });
        req.on("error", () => resolve(false));
        req.setTimeout(1e3, () => {
          req.destroy();
          resolve(false);
        });
      });
      if (ready) return true;
    } catch (_) {
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  return false;
}
function startBackendServer() {
  return new Promise(async (resolve, reject) => {
    var _a, _b;
    const isDev = !import_electron.app.isPackaged;
    const requestedPort = parseInt(String(DEFAULT_PORT), 10) || 3e3;
    const targetPort = await findAvailablePort(requestedPort);
    let serverScript = isDev ? import_path.default.join(__dirname, "../server.ts") : import_path.default.join(__dirname, "server.cjs");
    if (!isDev) {
      const possiblePaths = [
        import_path.default.join(__dirname, "server.cjs"),
        import_path.default.join(__dirname, "../dist-electron/server.cjs"),
        import_path.default.join(process.resourcesPath || "", "app.asar/dist-electron/server.cjs"),
        import_path.default.join(process.resourcesPath || "", "app/dist-electron/server.cjs")
      ];
      for (const p of possiblePaths) {
        if (p && import_fs.default.existsSync(p)) {
          serverScript = p;
          break;
        }
      }
    }
    const env = {
      ...process.env,
      PORT: String(targetPort),
      NODE_ENV: isDev ? "development" : "production",
      ELECTRON_RUN: "true",
      ELECTRON_RUN_AS_NODE: "1"
    };
    if (isDev) {
      const ready = await waitForBackend(targetPort, 2e3);
      if (ready) {
        resolve(targetPort);
        return;
      }
      try {
        serverProcess = (0, import_child_process.fork)(serverScript, [], {
          env: { ...env, ELECTRON_RUN_AS_NODE: void 0 },
          execArgv: ["--import", "tsx"]
        });
        const ok = await waitForBackend(targetPort);
        if (ok) resolve(targetPort);
        else reject(new Error(`Backend server failed to respond on port ${targetPort}.`));
      } catch (e) {
        reject(e);
      }
    } else {
      try {
        let processOutput = "";
        serverProcess = (0, import_child_process.fork)(serverScript, [], {
          env,
          stdio: ["ignore", "pipe", "pipe", "ipc"]
        });
        (_a = serverProcess.stdout) == null ? void 0 : _a.on("data", (data) => {
          processOutput += data.toString();
        });
        (_b = serverProcess.stderr) == null ? void 0 : _b.on("data", (data) => {
          processOutput += data.toString();
        });
        let hasExited = false;
        serverProcess.on("exit", (code, signal) => {
          hasExited = true;
          if (!serverProcess) return;
          reject(
            new Error(
              `Backend server process exited prematurely with code ${code} (signal: ${signal}).
Logs: ${processOutput || "None"}`
            )
          );
        });
        serverProcess.on("error", (err) => {
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
                `Backend server failed to respond on port ${targetPort} within timeout.
Log output: ${processOutput || "None"}`
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
function createMainWindow(port) {
  mainWindow = new import_electron.BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 980,
    minHeight: 650,
    title: "TITAN AI \u2014 The Ultimate Collective Intelligence Platform",
    backgroundColor: "#faf8f5",
    show: false,
    webPreferences: {
      preload: import_path.default.join(__dirname, "preload.cjs"),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true
    }
  });
  mainWindow.loadURL(`http://127.0.0.1:${port}`);
  mainWindow.once("ready-to-show", () => {
    mainWindow == null ? void 0 : mainWindow.show();
  });
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("http://") || url.startsWith("https://")) {
      import_electron.shell.openExternal(url);
    }
    return { action: "deny" };
  });
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}
var activePort = parseInt(String(DEFAULT_PORT), 10) || 3e3;
import_electron.app.whenReady().then(async () => {
  try {
    activePort = await startBackendServer();
    createMainWindow(activePort);
  } catch (err) {
    import_electron.dialog.showErrorBox(
      "TITAN AI Startup Failure",
      `Failed to launch local collective intelligence engine:
${err.message || err}

Please verify that port ${activePort} is not blocked by Windows Firewall or another application.`
    );
    import_electron.app.quit();
  }
  import_electron.app.on("activate", () => {
    if (import_electron.BrowserWindow.getAllWindows().length === 0 && mainWindow === null) {
      createMainWindow(activePort);
    }
  });
});
import_electron.app.on("window-all-closed", () => {
  if (serverProcess) {
    serverProcess.kill();
    serverProcess = null;
  }
  if (process.platform !== "darwin") {
    import_electron.app.quit();
  }
});
import_electron.app.on("before-quit", () => {
  if (serverProcess) {
    serverProcess.kill();
    serverProcess = null;
  }
});
