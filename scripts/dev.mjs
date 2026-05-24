import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { loadEnvFile, resolveDatabaseUrl } from "./load-env.mjs";
import { getRootDir, runNodeScript, spawnNodeScript } from "./process-utils.mjs";
import { devError, devInfo } from "./dev-output.mjs";
import { runPrismaGenerateSafe } from "./prisma-client.mjs";

const rootDir = getRootDir();
const isWin = process.platform === "win32";
const STUDIO_START_DELAY_MS = 4000;

loadEnvFile();
resolveDatabaseUrl();

const skipDocker = process.env.SKIP_DOCKER === "true";
const waitScript = resolve(rootDir, "scripts", "wait-for-db.mjs");
const runWebScript = resolve(rootDir, "scripts", "run-dev-web.mjs");
const runStudioScript = resolve(rootDir, "scripts", "run-dev-studio.mjs");

if (!skipDocker) {
  devInfo("[dev] Starting PostgreSQL (Docker)...");
  const result = spawnSync("docker", ["compose", "up", "-d"], {
    cwd: rootDir,
    stdio: "inherit",
    windowsHide: true,
  });
  if (result.status !== 0) {
    devError(
      "[dev] Could not start PostgreSQL via Docker.\n" +
        "  - Start Docker Desktop, or\n" +
        "  - Set SKIP_DOCKER=true in .env and use your local PostgreSQL."
    );
    process.exit(1);
  }
} else {
  const dbHost = process.env.DB_HOST ?? "localhost";
  const dbPort = process.env.DB_PORT ?? "5432";
  devInfo(
    `[dev] SKIP_DOCKER=true — using PostgreSQL at ${dbHost}:${dbPort} (database: ${process.env.DB_NAME ?? "—"})`
  );
}

const wait = runNodeScript(waitScript);
if (wait.status !== 0) process.exit(wait.status ?? 1);

if (!runPrismaGenerateSafe()) {
  process.exit(1);
}

devInfo("[dev] Starting Next.js (http://localhost:3000) + Prisma Studio (http://localhost:5555)...");

let webProcess = null;
let studioProcess = null;
let studioTimer = null;
let webExit = null;
let studioExit = null;

webProcess = spawnNodeScript(runWebScript);

studioTimer = setTimeout(() => {
  studioProcess = spawnNodeScript(runStudioScript);
  studioProcess.on("exit", onStudioExit);
}, STUDIO_START_DELAY_MS);

function onWebExit(code) {
  webExit = code ?? 0;
  if (studioExit !== null) process.exit(Math.max(webExit, studioExit));
}

function onStudioExit(code) {
  studioExit = code ?? 0;
  if (webExit !== null) process.exit(Math.max(webExit, studioExit));
}

webProcess.on("exit", onWebExit);

function shutdown() {
  if (studioTimer) clearTimeout(studioTimer);
  terminateProcess(webProcess, isWin);
  terminateProcess(studioProcess, isWin);
  if (!skipDocker) {
    spawnSync("docker", ["compose", "down"], {
      cwd: rootDir,
      stdio: "inherit",
      windowsHide: true,
    });
  }
  process.exit(0);
}

function terminateProcess(child, useTaskkill) {
  if (!child?.pid) return;
  if (useTaskkill) {
    spawnSync("taskkill", ["/pid", String(child.pid), "/T", "/F"], {
      stdio: "ignore",
      windowsHide: true,
    });
  } else {
    child.kill("SIGTERM");
  }
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
