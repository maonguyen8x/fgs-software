/**
 * Expands DATABASE_URL when .env contains un-interpolated ${DB_*} placeholders.
 * Next.js does not expand these; only yarn scripts did via load-env.mjs.
 */
export function resolveDatabaseUrl(): string | undefined {
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
    const url = `postgresql://${encodeURIComponent(DB_USERNAME)}:${encodeURIComponent(DB_PASSWORD)}@${DB_HOST}:${DB_PORT}/${DB_NAME}?schema=${DB_SCHEMA}`;
    process.env.DATABASE_URL = url;
    return url;
  }

  return DATABASE_URL;
}
