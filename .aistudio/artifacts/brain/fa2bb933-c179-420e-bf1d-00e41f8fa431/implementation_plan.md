# Implementation Plan: TITAN AI Windows 7 32-bit (x86) Desktop App & GitHub Actions

## Executive Summary
This plan details how to package the existing full-stack **TITAN AI** application (React 19, Vite, Express, and Google GenAI SDK) into a Windows 7 32-bit (ia32) desktop application without altering any user interfaces or removing existing features. The target output will be downloadable **NSIS installer (.exe)** and **Portable executable (.exe)** files compiled automatically via a dedicated **GitHub Actions workflow**.

---

## 1. Technical Audit & Compatibility Analysis

### Windows 7 & 32-bit (x86/ia32) Compatibility
- **Electron Version Constraint**:
  - Chromium officially dropped support for Windows 7, Windows 8, and Windows 8.1 in Chromium 110 (which corresponds to Electron 23+).
  - Therefore, **Electron 22.3.27** is the **last and highest production release** of Electron that officially supports Windows 7 (SP1) and Windows 8/8.1 for both x86 (ia32) and x64 architectures.
  - Packaging configuration will strictly target `arch: "ia32"` and pin `electron: "22.3.27"`.
- **Node.js & Frontend Tooling**:
  - The React frontend builds static assets (`dist/`) via Vite standard ESM build.
  - The Express backend (`server.ts` compiled to `server.cjs` or executed via bundled Node runtime) runs on `localhost` (port 3000 or dynamic available port) and serves the static frontend in production.
  - Electron `BrowserWindow` connects to the local Express backend, preserving 100% of the existing API integrations, multi-model collaboration engine, debate studio, and local storage persistence.

---

## 2. Desktop Architecture & Lifecycle

```
[Windows 7 x86 Operating System]
           │
           ▼
[Electron 22.3.27 Main Process (ia32)]
   ├── Starts Local Express Backend (server.cjs / server.ts)
   ├── Waits for backend readiness (healthcheck on /api/health)
   ├── Creates BrowserWindow (custom titlebar, native Windows frame)
   ├── Loads http://localhost:3000
   ├── Injects secure preload script (contextBridge)
   └── Graceful shutdown: terminates child backend process on window close
```

### Key Files to Create:
1. **`electron/main.ts`**:
   - Manages application lifecycle (`app.on('ready')`, `app.on('window-all-closed')`).
   - Spawns and supervises the Express server backend.
   - Monitors `/api/health` with retry and timeout before opening `BrowserWindow`.
   - Displays native error dialogs if the backend fails to start.
   - Cleans up child processes upon exit.
2. **`electron/preload.ts`**:
   - Secure context bridge exposing platform info (`isElectron: true`, `platform: 'win32'`, `arch: 'ia32'`).
3. **`electron-builder.json`**:
   - Configures `win.target: [{ target: "nsis", arch: ["ia32"] }, { target: "portable", arch: ["ia32"] }]`.
   - Product name: `TITAN AI`.
   - Output directory: `dist-electron`.

---

## 3. GitHub Actions CI/CD Workflow

### File: `.github/workflows/build-windows.yml`
- **Triggers**:
  - `push` to branches `main` or `master`.
  - Manual execution via `workflow_dispatch`.
- **Runner**: `windows-latest` (native Windows environment guarantees clean compilation of x86 PE headers and NSIS installer without wine emulator quirks).
- **Steps**:
  1. Checkout repository.
  2. Setup Node.js (Node 18 LTS).
  3. Install dependencies (`npm ci` or `npm install`).
  4. Build web frontend and server bundle (`npm run build`).
  5. Package 32-bit Windows binaries via `electron-builder --win --ia32`.
  6. Upload artifacts using `actions/upload-artifact@v4`:
     - `TITAN-AI-Setup-1.0.0-ia32.exe` (NSIS Installer)
     - `TITAN-AI-1.0.0-ia32.exe` (Portable Executable)
- **Mobile Download Accessibility**:
  - Once workflow completes, artifacts appear directly on the GitHub repository's **Actions** tab.
  - The user can open GitHub on their mobile phone browser or GitHub Mobile app, tap the latest run, and download the zipped EXE artifact.

---

## 4. Step-by-Step Execution Plan

### Phase 1: Dependencies & Scripts Configuration
- Install/add required desktop dev dependencies to `package.json`:
  - `electron`: `22.3.27` (pinned for Windows 7 x86 compatibility)
  - `electron-builder`: `^24.13.3` (compatible with electron 22 and Windows ia32 targets)
  - `cross-env`, `wait-on`, `concurrently` (for dev and build orchestration)
- Add build scripts:
  - `"build:electron"`: compiles electron main and preload scripts
  - `"package:win32"`: runs vite build + server build + electron-builder for Windows ia32

### Phase 2: Desktop Shell Implementation
- Implement `electron/main.ts` with auto-port detection, express server boot, health-check polling, and graceful child process termination.
- Implement `electron/preload.ts` with context bridge.
- Create `electron/tsconfig.json` targeting Node 16/ES2022.
- Configure `electron-builder.json` with target `nsis` and `portable` for `ia32`.

### Phase 3: GitHub Actions Workflow
- Create `.github/workflows/build-windows.yml` with dual trigger (`push` and `workflow_dispatch`), Windows runner, artifact archiving, and downloadable retention.

### Phase 4: Verification & Validation
- Compile frontend and backend bundles via `npm run build`.
- Validate TypeScript linting with `npm run lint`.
- Verify packaging configuration syntax and file integrity.
- Document mobile download instructions and local execution steps.

---

## 5. Security & Secret Management
- `GEMINI_API_KEY` and other provider keys remain server-side only.
- In desktop mode, keys are configured through the existing in-app **Settings & Provider Integration Center** and saved to the local user data directory (local SQLite or encrypted app storage), never bundled into the distributable installer.
