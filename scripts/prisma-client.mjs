import { existsSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { getRootDir, runPrisma } from "./process-utils.mjs";
import { devError, devInfo } from "./dev-output.mjs";

const schemaPath = resolve(getRootDir(), "prisma", "schema.prisma");
const clientIndexPath = resolve(getRootDir(), "node_modules", ".prisma", "client", "index.js");

export function isPrismaClientPresent() {
  return existsSync(clientIndexPath);
}

function isSchemaNewerThanClient() {
  if (!isPrismaClientPresent()) return true;
  const schemaTime = statSync(schemaPath).mtimeMs;
  const clientTime = statSync(clientIndexPath).mtimeMs;
  return schemaTime > clientTime;
}

export function shouldRunPrismaGenerateOnDev() {
  if (process.env.PRISMA_GENERATE_ON_DEV === "true") return true;
  if (process.env.PRISMA_GENERATE_ON_DEV === "false") return false;
  return !isPrismaClientPresent() || isSchemaNewerThanClient();
}

export function runPrismaGenerateSafe() {
  if (!shouldRunPrismaGenerateOnDev()) {
    devInfo("[dev] Prisma client is up to date — skipping generate.");
    return true;
  }

  devInfo("[dev] Generating Prisma client...");
  const result = runPrisma(["generate"]);

  if (result.status === 0) {
    return true;
  }

  devError("[dev] Prisma generate failed — the query engine file may be locked.");
  devError("[dev] Close other terminals running yarn dev, then retry.");

  if (isPrismaClientPresent()) {
    devInfo("[dev] Using existing Prisma client — continuing startup.");
    return true;
  }

  devError("[dev] Run `yarn db:generate` after closing other Node processes.");
  return false;
}
