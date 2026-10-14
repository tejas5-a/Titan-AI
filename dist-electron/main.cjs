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
var import_child_process = require("child_process");
var mainWindow = null;
var serverProcess = null;
var BACKEND_PORT = process.env.PORT || 3e3;
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
  return new Promise((resolve, reject) => {
    const isDev = !import_electron.app.isPackaged;
    const serverPath = isDev ? import_path.default.join(__dirname, "../server.ts") : import_path.default.join(process.resourcesPath, "server.cjs");
    const env = {
      ...process.env,
      PORT: String(BACKEND_PORT),
      NODE_ENV: isDev ? "development" : "production",
      ELECTRON_RUN: "true"
    };
    if (isDev) {
      waitForBackend(BACKEND_PORT, 4e3).then((ready) => {
        if (ready) {
          resolve(Number(BACKEND_PORT));
        } else {
          try {
            serverProcess = (0, import_child_process.fork)(serverPath, [], { env, execArgv: ["--import", "tsx"] });
            waitForBackend(BACKEND_PORT).then((ok) => {
              if (ok) resolve(Number(BACKEND_PORT));
              else reject(new Error("Backend server failed to respond to health check."));
            });
          } catch (e) {
            reject(e);
          }
        }
      });
    } else {
      try {
        const prodServerScript = import_path.default.join(__dirname, "server.cjs");
        serverProcess = (0, import_child_process.fork)(prodServerScript, [], { env });
        waitForBackend(BACKEND_PORT).then((ok) => {
          if (ok) resolve(Number(BACKEND_PORT));
          else reject(new Error("TITAN AI backend failed to initialize."));
        });
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
import_electron.app.whenReady().then(async () => {
  try {
    const port = await startBackendServer();
    createMainWindow(port);
  } catch (err) {
    import_electron.dialog.showErrorBox(
      "TITAN AI Startup Failure",
      `Failed to launch local collective intelligence engine:
${err.message || err}

Please verify that port ${BACKEND_PORT} is not blocked by Windows Firewall or another application.`
    );
    import_electron.app.quit();
  }
  import_electron.app.on("activate", () => {
    if (import_electron.BrowserWindow.getAllWindows().length === 0 && mainWindow === null) {
      createMainWindow(Number(BACKEND_PORT));
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
