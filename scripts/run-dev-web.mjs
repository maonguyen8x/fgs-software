import { loadEnvFile, resolveDatabaseUrl } from "./load-env.mjs";
import { runNext } from "./process-utils.mjs";

loadEnvFile();
resolveDatabaseUrl();

const next = runNext(["dev"]);
process.exit(next.status ?? 0);
