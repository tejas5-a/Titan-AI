declare module 'electron' {
  export const app: any;
  export class BrowserWindow {
    constructor(options?: any);
    loadURL(url: string): Promise<void>;
    once(event: string, callback: () => void): void;
    on(event: string, callback: () => void): void;
    show(): void;
    webContents: any;
    static getAllWindows(): any[];
  }
  export const dialog: {
    showErrorBox(title: string, content: string): void;
  };
  export const shell: {
    openExternal(url: string): Promise<void>;
  };
  export const contextBridge: {
    exposeInMainWorld(apiKey: string, api: any): void;
  };
}

interface Window {
  titanDesktop?: {
    isElectron: boolean;
    platform: string;
    arch: string;
    targetOS: string;
    appVersion: string;
  };
}
