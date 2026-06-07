import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/**
 * Load .env into process.env (simple parser; does not expand ${VAR} references).
 */
export function loadEnvFile(filename = ".env") {
  const envPath = resolve(rootDir, filename);
  if (!existsSync(envPath)) return;

  const content = readFileSync(envPath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;

    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

/**
 * Build DATABASE_URL from DB_* variables when Prisma-style interpolation was not expanded.
 */
export function resolveDatabaseUrl() {
  const {
    DATABASE_URL,
    DB_HOST,
    DB_PORT,
    DB_USERNAME,
    DB_PASSWORD,
    DB_NAME,
    DB_SCHEMA = "public",
  } = process.env;

  if (DATABASE_URL && !DATABASE_URL.includes("${")) {
    return DATABASE_URL;
  }

  if (DB_HOST && DB_PORT && DB_USERNAME && DB_PASSWORD && DB_NAME) {
    const url = `postgresql://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?schema=${DB_SCHEMA}`;
    process.env.DATABASE_URL = url;
    if (!process.env.DIRECT_URL || process.env.DIRECT_URL.includes("${")) {
      process.env.DIRECT_URL = url;
    }
    return url;
  }

  return DATABASE_URL;
}

/** Ensure DIRECT_URL is set (Prisma schema requires it). */
export function resolveDirectUrl() {
  resolveDatabaseUrl();
  const { DATABASE_URL, DIRECT_URL } = process.env;
  if (DIRECT_URL && !DIRECT_URL.includes("${")) return DIRECT_URL;
  if (DATABASE_URL && !DATABASE_URL.includes("${")) {
    process.env.DIRECT_URL = DATABASE_URL;
    return DATABASE_URL;
  }
  return DIRECT_URL;
}
