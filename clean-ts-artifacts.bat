@echo off
REM TypeScript Build Artifacts Cleanup Script (Windows)
REM Removes stale .d.ts and .tsbuildinfo files that can cause TS6305 errors

echo 🧹 Cleaning TypeScript build artifacts...

REM Remove any stray .d.ts files in the root
echo   → Removing root .d.ts files...
del /f /q vite.config.d.ts 2>nul
del /f /q vite.config.minimal.d.ts 2>nul
del /f /q vitest.config.d.ts 2>nul
del /f /q playwright.config.d.ts 2>nul
del /f /q *.d.ts 2>nul

REM Remove TypeScript build info files
echo   → Removing .tsbuildinfo files...
del /f /q /s node_modules\.tmp\*.tsbuildinfo 2>nul
del /f /q *.tsbuildinfo 2>nul
del /f /q tsconfig.tsbuildinfo 2>nul

REM Clean Vite cache
echo   → Cleaning Vite cache...
rmdir /s /q node_modules\.vite 2>nul

REM Clean TypeScript cache
echo   → Cleaning TypeScript cache...
del /f /q .tsbuildinfo 2>nul

echo ✅ Cleanup complete!
echo.
echo Now run: npm run type-check
