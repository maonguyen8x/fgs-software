export async function register() {
  const { resolveDatabaseUrl } = await import("@/lib/db/resolve-database-url");
  resolveDatabaseUrl();
}
