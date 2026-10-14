// electron/preload.ts
var import_electron = require("electron");
import_electron.contextBridge.exposeInMainWorld("titanDesktop", {
  isElectron: true,
  platform: "win32",
  arch: "ia32",
  targetOS: "Windows 7 x86",
  appVersion: "1.0.0"
});
