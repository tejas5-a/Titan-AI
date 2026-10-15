# Fix GitHub Actions Packaging & Publishing Configuration Plan

## Root Cause
When `electron-builder` builds the Windows 32-bit installers (`nsis` and `portable`) on GitHub Actions, it checks whether it is running in a CI/repository environment. By default, `electron-builder` attempts to publish release artifacts to GitHub Releases unless explicit publishing options are provided. Because no `GH_TOKEN` or GitHub Personal Access Token was set in the environment, `electron-builder` failed during the post-package publish phase with:
`GitHub Personal Access Token is not set, neither programmatically, nor using env "GH_TOKEN"`.

## Resolutions Applied
1. **Explicitly Disabled Publishing in `package.json`**:
   Updated the `"package:win32"` script:
   ```json
   "package:win32": "electron-builder --win --ia32 --config electron-builder.json --publish never"
   ```
2. **Explicitly Disabled Publishing in `electron-builder.json`**:
   Added `"publish": null` to `electron-builder.json` so `electron-builder` does not attempt publishing regardless of execution flags or repository environment variables.
3. **Artifact Upload Verification**:
   Verified that `.github/workflows/build-windows.yml` correctly collects generated installers from `dist-electron-build/`:
   - `TITAN AI-Setup-1.0.0-ia32.exe`
   - `TITAN AI-1.0.0-Portable-ia32.exe`
   using `actions/upload-artifact@v4` as build artifacts without attempting a GitHub release.

## Verification
- Verified web build (`npm run build`).
- Verified Electron main & preload bundling (`npm run build:electron`).
- Verified TypeScript compilation (`npm run lint`).
- Verified applet compilation (`compile_applet`).
