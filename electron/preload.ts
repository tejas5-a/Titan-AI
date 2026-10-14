import { contextBridge } from 'electron';

// Expose safe desktop platform telemetry to renderer
contextBridge.exposeInMainWorld('titanDesktop', {
  isElectron: true,
  platform: 'win32',
  arch: 'ia32',
  targetOS: 'Windows 7 x86',
  appVersion: '1.0.0',
});
