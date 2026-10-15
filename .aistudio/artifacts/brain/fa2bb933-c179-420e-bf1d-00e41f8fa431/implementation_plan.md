# Tailwind CSS v4 Oxide & Lightning CSS Windows Native Dependency Fix Plan

Resolve the GitHub Actions web application build failure (`vite build`) caused by missing native module `@tailwindcss/oxide-win32-x64-msvc` and `lightningcss.win32-x64-msvc.node` on `windows-latest` runners by explicitly declaring platform bindings for both `@tailwindcss/oxide` and `lightningcss` in `package.json` optional dependencies and synchronizing `package-lock.json`.

## User Review & Critical Decisions

> [!NOTE]
> All requirements and technical constraints are preserved in full. No Claude-inspired TITAN AI UI elements, features, or Windows 32-bit packaging configurations are altered.

- **Confirmed Decision 1**: Retain Vite 8, Tailwind CSS v4, Node.js 20.x, and Electron 22.3.27 target architecture intact.
- **Target Resolution**: Include `@tailwindcss/oxide-win32-x64-msvc` and `lightningcss-win32-x64-msvc` platform binaries as optional dependencies in `package.json` and synchronize `package-lock.json` so `npm ci` on Windows GitHub Actions runner successfully installs the native binary modules required by `@tailwindcss/vite` and Tailwind CSS v4.

---

## 1. Overview & Core Concept

- **What It Does**: Fixes the GitHub Actions CI pipeline for TITAN AI desktop installer releases by resolving native C++ binding resolution for Tailwind CSS v4 Oxide engine and Lightning CSS on Windows 64-bit build runners.
- **Target Environment**: GitHub Actions `windows-latest` x64 runner (building Vite web application) producing a Windows 7 32-bit (`ia32`) Electron desktop package.
- **Key Value**: Enables automated, reliable automated builds and installer packaging in GitHub Actions without native binding runtime module errors.

---

## 2. User Experience & Visual Design

- **UI Posture**: Unchanged. Preserves the full Claude-inspired TITAN AI interface, sidebar layout, AI chat view, model selection, prompt settings, and glassmorphic dark theme styling.
- **Visual Feedback**: No UI telemetry, system status logs, or build indicators rendered in the app interface.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Native Platform Optional Dependencies in `package.json`**
  - *Chosen Approach*: Explicitly define `@tailwindcss/oxide-win32-x64-msvc`, `@tailwindcss/oxide-win32-arm64-msvc`, `lightningcss-win32-x64-msvc`, `lightningcss-win32-ia32-msvc`, and other cross-platform binaries in `optionalDependencies` inside `package.json`, then regenerate `package-lock.json`.
  - *Why*: Ensures `npm` records dependency metadata, checksums, and version tarballs for Windows x64 runners in `package-lock.json` regardless of which OS generated the initial lockfile.

- **Decision 2: GitHub Actions Dependency Installation Policy**
  - *Chosen Approach*: Maintain `npm ci --legacy-peer-deps` in `.github/workflows/build-windows.yml` ensuring `npm` installs optional dependencies without `--omit=optional`.
  - *Why*: Guaranteed bit-for-bit reproducible installs while downloading native binaries appropriate for `windows-latest` x64.

---

## 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       GitHub Actions Workflow Runner                        │
│                               (windows-latest)                              │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          npm ci --legacy-peer-deps                          │
│                                                                             │
│  Reads package-lock.json (containing locked oxide & lightningcss binaries) │
│  Installs node_modules/@tailwindcss/oxide-win32-x64-msvc/...              │
│  Installs node_modules/lightningcss-win32-x64-msvc/...                      │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                   npm run build  ──►  vite build                            │
│                                                                             │
│  Loads vite.config.ts                                                       │
│  Executes @tailwindcss/vite                                                 │
│  Requires @tailwindcss/oxide-win32-x64-msvc (Found! ✅)                     │
│  Outputs production web bundle to dist/                                     │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│       npm run build:electron  ──►  npm run package:win32 (ia32 EXE)        │
└─────────────────────────────────────────────────────────────────────────────┘
```

- **Verification Results**:
  1. Synchronized `package-lock.json` using `npm install --legacy-peer-deps`.
  2. Executed `npm ci --legacy-peer-deps` (clean install verification).
  3. Executed `npm run build` (`vite build`) - completed in 891ms.
  4. Executed `npm run build:electron` - completed in 264ms.
  5. Executed `npm run lint` (`tsc --noEmit`) - passed with 0 errors.
  6. Verified applet compilation via `compile_applet`.
