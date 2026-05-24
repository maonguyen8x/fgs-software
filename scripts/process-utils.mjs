import { spawn, spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export function getRootDir() {
  return rootDir;
}

export function runNodeScript(scriptPath, options = {}) {
  return spawnSync(process.execPath, [scriptPath], {
    cwd: options.cwd ?? rootDir,
    stdio: "inherit",
    env: process.env,
    windowsHide: true,
  });
}

export function spawnNodeScript(scriptPath, options = {}) {
  return spawn(process.execPath, [scriptPath], {
    cwd: options.cwd ?? rootDir,
    stdio: "inherit",
    env: process.env,
    windowsHide: true,
  });
}

export function runPrisma(args) {
  const prismaCli = resolve(rootDir, "node_modules", "prisma", "build", "index.js");
  return spawnSync(process.execPath, [prismaCli, ...args], {
    cwd: rootDir,
    stdio: "inherit",
    env: process.env,
    windowsHide: true,
  });
}

export function runNext(args) {
  const nextCli = resolve(rootDir, "node_modules", "next", "dist", "bin", "next");
  return spawnSync(process.execPath, [nextCli, ...args], {
    cwd: rootDir,
    stdio: "inherit",
    env: process.env,
    windowsHide: true,
  });
}
