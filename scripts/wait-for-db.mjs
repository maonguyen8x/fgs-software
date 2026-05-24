import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { loadEnvFile } from "./load-env.mjs";
import { getRootDir } from "./process-utils.mjs";
import { devError, devInfo } from "./dev-output.mjs";

const rootDir = getRootDir();

loadEnvFile();

const host = process.env.DB_HOST ?? "127.0.0.1";
const port = process.env.DB_PORT ?? "5432";
const timeout = process.env.DB_WAIT_TIMEOUT ?? "120000";
const resource = `tcp:${host}:${port}`;
const waitOnBin = resolve(rootDir, "node_modules", "wait-on", "bin", "wait-on");

const result = spawnSync(process.execPath, [waitOnBin, resource, "-t", timeout], {
  cwd: rootDir,
  stdio: "inherit",
  env: process.env,
  windowsHide: true,
});

if (result.status !== 0) {
  devError(`[db] PostgreSQL not reachable at ${host}:${port}`);
  process.exit(result.status ?? 1);
}

devInfo(`[db] PostgreSQL ready at ${host}:${port}`);
