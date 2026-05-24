import { loadEnvFile, resolveDatabaseUrl } from "./load-env.mjs";
import { getRootDir, runPrisma } from "./process-utils.mjs";

loadEnvFile();
resolveDatabaseUrl();

const studio = runPrisma(["studio", "--port", "5555", "--browser", "none"]);
process.exit(studio.status ?? 0);
