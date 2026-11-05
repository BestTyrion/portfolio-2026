@echo off
setlocal EnableExtensions
cd /d "%~dp0"
title LUOSHEN Local Preview

where node >nul 2>&1
if errorlevel 1 goto NO_NODE
node -e "const [a,b]=process.versions.node.split('.').map(Number);process.exit(a>22||a===22&&b>=13?0:1)"
if errorlevel 1 goto OLD_NODE

if not exist ".openai\hosting.json" goto INCOMPLETE_PACKAGE
if not exist "build\sites-vite-plugin.ts" goto INCOMPLETE_PACKAGE

set "SITES_PNPM_SHARED_STORE=%CD%\.sites-runtime\pnpm-store"
where pnpm >nul 2>&1
if not errorlevel 1 (
  set "PNPM_CMD=pnpm"
  goto HAVE_PNPM
)
where corepack >nul 2>&1
if errorlevel 1 goto NO_PNPM
set "PNPM_CMD=corepack pnpm"
call corepack pnpm --version >nul 2>&1
if errorlevel 1 goto NO_PNPM

:HAVE_PNPM
if not exist "node_modules\vinext\dist\cli.js" (
  echo Installing project dependencies. This may take several minutes...
  echo Installation messages will remain visible. A hidden approval prompt cannot be masked by the progress display.
  call %PNPM_CMD% install --frozen-lockfile --reporter=append-only
  if errorlevel 1 goto INSTALL_FAILED
)

powershell -NoProfile -Command "if (Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction SilentlyContinue) { exit 1 }"
if errorlevel 1 goto PORT_BUSY

echo Starting LUOSHEN. Keep this window open while using the app.
echo The browser will open http://localhost:5173/ when ready.
start "" /min powershell -NoProfile -Command "$u='http://localhost:5173/'; for($i=0;$i -lt 120;$i++){ try { $r=Invoke-WebRequest -Uri $u -UseBasicParsing -TimeoutSec 2; if($r.StatusCode -lt 500){ Start-Process $u; break } } catch {}; Start-Sleep -Seconds 1 }"
node scripts\run-framework.mjs dev --strictPort
if errorlevel 1 goto SERVER_FAILED
goto END

:NO_NODE
echo Node.js is missing. Install Node.js 22.13 or newer, then double-click this file again.
goto END
:OLD_NODE
echo Node.js is too old. Install Node.js 22.13 or newer, then try again.
goto END
:NO_PNPM
echo pnpm is missing. Install pnpm 11.25 or enable Corepack, then try again.
goto END
:INSTALL_FAILED
echo Dependency installation failed. Check your network and the messages above.
goto END
:PORT_BUSY
echo Port 5173 is already in use. Close the other local server and try again.
goto END
:SERVER_FAILED
echo LUOSHEN could not start. Read the error above.
goto END
:INCOMPLETE_PACKAGE
echo LUOSHEN is missing required local configuration files.
echo Extract the complete ZIP, or apply the configuration repair package to this folder.
:END
echo.
if not defined LUOSHEN_FROM_EXE (
  echo Press any key to close this window.
  pause >nul
)
