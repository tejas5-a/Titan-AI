# Fix GitHub Actions Windows 7 x86 Build & Lockfile Resolution

Resolve the GitHub Actions build error (`Dependencies lock file is not found in D:\a\Titan-AI\Titan-AI. Supported file patterns: package-lock.json, npm-shrinkwrap.json, yarn.lock`) by generating a pristine `package-lock.json` using npm, updating `.github/workflows/build-windows.yml` for robust dependency caching and execution, and maintaining full Windows 7 32-bit (x86) Electron 22 compatibility without touching the Claude-inspired UI.

## User Review & Critical Decisions

> [!IMPORTANT]
> The primary failure in GitHub Actions occurred because `actions/setup-node@v4` was configured with `cache: 'npm'`, which requires a lockfile (`package-lock.json`) in the repository. Currently, the repository contains a `bun.lock` file instead of `package-lock.json`. 

- **Lockfile Generation**: Generate an official `package-lock.json` using npm matching the exact `package.json` dependencies tree and commit it alongside `package.json`.
- **Workflow Resilience**: Update `.github/workflows/build-windows.yml` so `cache: 'npm'` works reliably when `package-lock.json` is committed, and use `npm ci --legacy-peer-deps` for reproducible CI builds.
- **Node.js & Electron 22 Pinning**: Retain Node.js 18 LTS on the `windows-latest` runner because Electron 22.3.27 and `electron-builder` 26 require Node 18 for seamless 32-bit NSIS/portable bundling.
- **UI & Feature Preservation**: Zero changes to the Claude UI design system, model integrations, debate studio, coding studio, or settings.

---

## 1. Overview & Root Cause Analysis

### The Failure Mechanism
In GitHub Actions:
```yaml
- name: Setup Node.js (LTS 18)
  uses: actions/setup-node@v4
  with:
    node-version: 18
    cache: 'npm' # <--- Fails here before running any script
```
`actions/setup-node` scans for `package-lock.json`, `npm-shrinkwrap.json`, or `yarn.lock` to compute the cache hash. Because only `package.json` and `bun.lock` were present in the root directory, the workflow threw the fatal error:
`"Dependencies lock file is not found in D:\a\Titan-AI\Titan-AI. Supported file patterns: package-lock.json, npm-shrinkwrap.json, yarn.lock"`

### Targeted Resolution
1. **Generate `package-lock.json`**: Execute `npm install --package-lock-only` (or install dependencies) to produce a standard, deterministic `package-lock.json` v3 lockfile matching `package.json`.
2. **Harden `.github/workflows/build-windows.yml`**:
   - Keep Node.js 18 LTS (`18.20.x`).
   - Use `actions/setup-node@v4` with `cache: 'npm'`.
   - Update the installation step to run `npm ci --legacy-peer-deps` (with automatic fallback to `npm install --legacy-peer-deps` if run in environments where the lockfile is being synced).
   - Ensure the electron packaging cache paths and output artifact paths are properly configured.
3. **Verify Git Tracking**: Ensure `.gitignore` explicitly allows `package-lock.json` (verified: `.gitignore` currently does not ignore it).

---

## 2. User Experience & Visual Design

> [!NOTE]
> All existing user interface components and visual themes are strictly preserved:

- **Warm Claude UI Palette**: Ecru paper backgrounds (`#FAF8F5`), obsidian dark mode (`#181716`), subtle warm borders (`#E8E2D8` / `#33302C`), and terracotta accents (`#C25E2E`).
- **All 13 Workspaces Preserved**: Collective Chat, Debate Studio, Coding Studio, Deep Research, Vision Studio, Knowledge Base, Agent Workspace, Projects, Model Lab, Usage Costs, and Settings.
- **No Regression**: Visual design, icons, and layout rules remain identical to the current production state.

---

## 3. Key Technical Decisions & Trade-Offs

### Decision 1: `npm ci` vs `npm install` in GitHub Actions
- **Chosen Approach**: Use `npm ci --legacy-peer-deps` when `package-lock.json` exists in the repo.
- **Why**: `npm ci` installs the exact dependency graph recorded in `package-lock.json` without modifying it, making CI builds faster, deterministic, and immune to upstream package drift.
- **Trade-off**: Requires `package-lock.json` to be synchronized with `package.json`.

### Decision 2: Retain Node 18 on Windows Runner
- **Chosen Approach**: Keep `node-version: 18` in GitHub Actions.
- **Why**: Electron 22.3.27 embeds Node 16.17.5 / Chromium 108 (the final release branch supporting Windows 7/8/8.1 and 32-bit ia32). Node 18 on the host runner provides the most stable build environment for `electron-builder` to target 32-bit Windows architectures without V8 compatibility regressions.

---

## 4. Technical Architecture & Build Workflow Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                    GitHub Actions Workflow                   │
│               (.github/workflows/build-windows.yml)          │
└──────────────────────────────┬───────────────────────────────┘
                               │
            ┌──────────────────▼──────────────────┐
            │   Checkout repo (package.json +     │
            │        package-lock.json)           │
            └──────────────────┬──────────────────┘
                               │
            ┌──────────────────▼──────────────────┐
            │   Setup Node.js 18 LTS              │
            │   with npm cache hashing            │
            └──────────────────┬──────────────────┘
                               │
            ┌──────────────────▼──────────────────┐
            │   npm ci --legacy-peer-deps         │
            │   (reproducible clean install)      │
            └──────────────────┬──────────────────┘
                               │
            ┌──────────────────▼──────────────────┐
            │   npm run build (Vite frontend)     │
            │   npm run build:electron (esbuild)  │
            └──────────────────┬──────────────────┘
                               │
            ┌──────────────────▼──────────────────┐
            │   npm run package:win32             │
            │   (Electron 22.3.27 - ia32)         │
            │   • NSIS Setup Installer (.exe)     │
            │   • Standalone Portable (.exe)      │
            └──────────────────┬──────────────────┘
                               │
            ┌──────────────────▼──────────────────┐
            │   Upload Artifact:                  │
            │   TITAN-AI-Windows-7-x86-Installers │
            └─────────────────────────────────────┘
```

---

## 5. Execution Steps

1. **Lockfile Generation**: Run the native package manager command to synthesize a valid, complete `package-lock.json` based on the existing `package.json`.
2. **Workflow Update**: Inspect and refine `.github/workflows/build-windows.yml` to ensure clean caching, reliable dependency installation, and proper error handling.
3. **Verification**: Run `compile_applet` and `lint_applet` to guarantee the codebase compiles without any TypeScript or Vite regressions.
4. **Step-by-Step GitHub Guide**: Provide clear, mobile-friendly instructions on how to push the new `package-lock.json` and workflow to GitHub and download the resulting executable artifacts.
