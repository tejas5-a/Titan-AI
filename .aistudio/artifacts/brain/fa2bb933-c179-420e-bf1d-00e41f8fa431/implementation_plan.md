# Lightning CSS Windows Native Dependency Fix & Workflow Synchronization Plan

Resolve the GitHub Actions web application build failure (`vite build`) caused by missing native module `../lightningcss.win32-x64-msvc.node` on `windows-latest` runners by explicitly declaring Lightning CSS platform bindings in `package.json` optional dependencies and synchronizing `package-lock.json`.

## User Review & Critical Decisions

> [!NOTE]
> All requirements and technical constraints from previous turns are preserved in full. No Claude-inspired TITAN AI UI elements, features, or Windows 32-bit packaging configurations are altered.

- **Confirmed Decision 1**: Retain Vite 8, Tailwind CSS v4, Node.js 20.x, and Electron 22.3.27 target architecture intact.
- **Target Resolution**: Include `lightningcss-win32-x64-msvc` and platform binaries as optional dependencies in `package.json` and synchronize `package-lock.json` so `npm ci` on Windows GitHub Actions runner successfully installs the native binary module required by `@tailwindcss/node` / `@tailwindcss/vite`.

---

## 1. Overview & Core Concept

- **What It Does**: Fixes the GitHub Actions CI pipeline for TITAN AI desktop installer releases by resolving native C++ binding resolution for Lightning CSS on Windows 64-bit build runners.
- **Target Environment**: GitHub Actions `windows-latest` x64 runner (building Vite web application) producing a Windows 7 32-bit (`ia32`) Electron desktop package.
- **Key Value**: Enables automated, reliable automated builds and installer packaging in GitHub Actions without `lightningcss.win32-x64-msvc.node` module errors.

---

## 2. User Experience & Visual Design

- **UI Posture**: Unchanged. Preserves the full Claude-inspired TITAN AI interface, sidebar layout, AI chat view, model selection, prompt settings, and glassmorphic dark theme styling.
- **Visual Feedback**: No UI telemetry, system status logs, or build indicators rendered in the app interface.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Native Platform Optional Dependencies in `package.json`**
  - *Chosen Approach*: Explicitly define `lightningcss-win32-x64-msvc`, `lightningcss-win32-ia32-msvc`, and `lightningcss-linux-x64-gnu` in `optionalDependencies` inside `package.json`, then regenerate `package-lock.json`.
  - *Why*: Ensures `npm` records dependency metadata, checksums, and version tarballs for Windows x64 runners in `package-lock.json` regardless of which OS generated the initial lockfile.
  - *Alternatives Considered*: Disabling Lightning CSS in Tailwind CSS v4 (not supported in Tailwind v4 `@tailwindcss/vite` plugin without breaking CSS processing).

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
│  Reads package-lock.json (containing locked lightningcss native binaries)     │
│  Installs node_modules/@tailwindcss/node/node_modules/lightningcss/...     │
│  Installs node_modules/lightningcss-win32-x64-msvc/                         │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                   npm run build  ──►  vite build                            │
│                                                                             │
│  Loads vite.config.ts                                                       │
│  Executes @tailwindcss/vite                                                 │
│  Requires lightningcss.win32-x64-msvc.node (Found! ✅)                       │
│  Outputs production web bundle to dist/                                     │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│       npm run build:electron  ──►  npm run package:win32 (ia32 EXE)        │
└─────────────────────────────────────────────────────────────────────────────┘
```

- **Dependency Mapping**:
  - `package.json`: Add `optionalDependencies` listing `lightningcss-win32-x64-msvc` matching Tailwind's `lightningcss` version (`^1.29.0`).
  - `package-lock.json`: Synchronized graph incorporating native binary tarballs for all target build platforms.
  - `.github/workflows/build-windows.yml`: Verified setup step with Node.js 20.x and `npm ci` execution.

- **Verification Strategy**:
  1. `npm install --package-lock-only --legacy-peer-deps` to lock all optional platform binaries.
  2. `npm run build` (`vite build`) to confirm web bundle compilation.
  3. `npm run lint` (`tsc --noEmit`) to ensure clean typing.
  4. `compile_applet` to verify applet integrity.
