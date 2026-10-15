# Implementation Plan - Windows 7 32-bit Polyfill & Desktop Startup Fix

## Problem Overview
When running TITAN AI on Windows 7 32-bit (ia32), the backend server fails to start with:
`ReferenceError: ReadableStream is not defined at Object.<anonymous> (server.cjs:62355:15)`

This occurs because Electron 22 bundles Node.js v16.x, which includes Web Streams API in `stream/web`, but does not attach `ReadableStream`, `WritableStream`, or `TransformStream` to `globalThis` by default. Third-party packages (such as `@google/genai` or web fetch utilities) expect `ReadableStream` to be present globally.

## Solution Architecture

### 1. Source Code Polyfill Integration
Update `server.ts` and `electron/main.ts` so that when `dist-electron/server.cjs` is bundled by `esbuild`, a standard polyfill runs prior to importing any dependencies:
```ts
if (typeof globalThis.ReadableStream === 'undefined') {
  try {
    const streamWeb = require('node:stream/web') || require('stream/web');
    if (streamWeb) {
      if (streamWeb.ReadableStream) globalThis.ReadableStream = streamWeb.ReadableStream;
      if (streamWeb.WritableStream) globalThis.WritableStream = streamWeb.WritableStream;
      if (streamWeb.TransformStream) globalThis.TransformStream = streamWeb.TransformStream;
      if (streamWeb.ByteLengthQueuingStrategy) globalThis.ByteLengthQueuingStrategy = streamWeb.ByteLengthQueuingStrategy;
      if (streamWeb.CountQueuingStrategy) globalThis.CountQueuingStrategy = streamWeb.CountQueuingStrategy;
    }
  } catch (_e) {
    // Fallback if needed
  }
}
```

Add `--banner:js` to `esbuild` build script in `package.json` to guarantee the polyfill is placed at line 1 of `dist-electron/server.cjs` before any external module scope evaluates.

### 2. Windows 7 Compatibility & Verification
- **Windows 7 Support Assessment:** Electron 22.3.27 is the last Electron release family supporting Windows 7/8/8.1. Combined with 32-bit (`ia32`) compilation, the app is fully compatible with Windows 7 32-bit once the `ReadableStream` global is defined.
- **Provide Step-by-Step CMD Guide:** Step-by-step instructions for extracting `%LOCALAPPDATA%\Programs\TITAN AI\resources\app.asar`, inserting the polyfill line into `server.cjs`, and repacking `app.asar`.
- **Version Verification Guide:** Commands and steps to check the bundled Electron/Node.js version.

## Proposed Changes

### Repository Code
- Modify `server.ts` (top of file)
- Modify `package.json` (`build:electron` script with banner or explicit preamble)
- Verify `npm run build:electron` and `compile_applet`

### User Guide
- Step-by-step Windows 7 CMD commands to patch an already installed desktop build without recompiling from source.
