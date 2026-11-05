const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawn } = require("node:child_process");
const readline = require("node:readline");

const directory = path.dirname(process.execPath);
const startFile = path.join(directory, "START_LUOSHEN.cmd");
const localLog = path.join(directory, "LUOSHEN-launcher.log");
const fallbackLog = path.join(os.tmpdir(), "LUOSHEN-launcher.log");
let logFile = localLog;

function log(message) {
  const line = `${new Date().toISOString()} ${message}\r\n`;
  try {
    fs.appendFileSync(logFile, line);
  } catch {
    logFile = fallbackLog;
    try { fs.appendFileSync(logFile, line); } catch { /* Console still shows the error. */ }
  }
}

function waitForKey() {
  if (!process.stdin.isTTY) return;
  const input = readline.createInterface({ input: process.stdin, output: process.stdout });
  input.question("\nPress Enter to close this window...", () => input.close());
}

console.log("LUOSHEN local website launcher");
console.log(`Folder: ${directory}`);
console.log("Keep this window open while using the website.\n");
log(`EXE started in ${directory}`);

if (!fs.existsSync(startFile)) {
  const message = "START_LUOSHEN.cmd was not found next to LUOSHEN.exe. Extract the complete ZIP before starting.";
  console.error(message);
  log(message);
  waitForKey();
} else {
  console.log("Starting website. The first run can take several minutes while dependencies download.");
  console.log("When ready, open http://localhost:5173/ if the browser does not open automatically.\n");
  // Keep the EXE attached to this console. The command lives in the same
  // extracted folder, so Unicode or spaces in the parent path need no quoting.
  const child = spawn("cmd.exe", ["/d", "/c", "call START_LUOSHEN.cmd"], {
    cwd: directory,
    env: { ...process.env, LUOSHEN_FROM_EXE: "1" },
    stdio: "inherit",
    windowsHide: false,
  });
  child.once("error", (error) => {
    const message = `Could not start Windows command shell: ${error.message}`;
    console.error(message);
    log(message);
    waitForKey();
  });
  child.once("exit", (code, signal) => {
    const message = `Local website stopped (exit code ${code ?? "unknown"}${signal ? `, signal ${signal}` : ""}).`;
    console.log(`\n${message}`);
    log(message);
    waitForKey();
  });
}
