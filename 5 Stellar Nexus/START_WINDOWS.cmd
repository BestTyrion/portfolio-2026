@echo off
chcp 65001 >nul
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
 echo Please install Node.js 24 LTS, then reopen this launcher.
 pause
 exit /b 1
)
if not exist node_modules (
 echo Installing dependencies. First run needs Internet access.
 call npx --yes pnpm@11.25.0 install --frozen-lockfile
 if errorlevel 1 goto fail
)
if not exist .sites-runtime\local-migrations.json (
 node scripts/local-setup.mjs
 if errorlevel 1 goto fail
)
echo Open http://localhost:5173/ when the server is ready.
echo Keep this window open while using Stellar Nexus.
call npm run dev
pause
exit /b
:fail
echo Startup failed. Please copy the error above for diagnosis.
pause
exit /b 1
