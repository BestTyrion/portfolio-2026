@echo off
setlocal EnableExtensions
cd /d "%~dp0"
title LUOSHEN Windows Check
echo LUOSHEN Windows check
echo Folder: %CD%
echo.
if exist "LUOSHEN.exe" (echo [OK] LUOSHEN.exe exists) else (echo [ERROR] LUOSHEN.exe is missing)
if exist "START_LUOSHEN.cmd" (echo [OK] START_LUOSHEN.cmd exists) else (echo [ERROR] START_LUOSHEN.cmd is missing)
if exist "package.json" (echo [OK] Website source exists) else (echo [ERROR] package.json is missing)
if exist "scripts\run-framework.mjs" (echo [OK] Server script exists) else (echo [ERROR] Server script is missing)
echo.
echo Node.js:
where node
if errorlevel 1 echo [ERROR] Node.js is not installed or not on PATH.
node --version 2>nul
echo.
echo pnpm:
where pnpm
if errorlevel 1 echo pnpm is not on PATH. Corepack may still be available.
pnpm --version 2>nul
echo.
echo Launcher log:
if exist "LUOSHEN-launcher.log" (type "LUOSHEN-launcher.log") else (echo No log next to EXE.)
if exist "%TEMP%\LUOSHEN-launcher.log" (type "%TEMP%\LUOSHEN-launcher.log") else (echo No log in Windows temporary folder.)
echo.
echo If the files and Node.js are present, run START_LUOSHEN.cmd.
echo Press any key to close.
pause >nul
