import { runPrismaGenerateSafe } from "./prisma-client.mjs";
import { loadEnvFile } from "./load-env.mjs";

process.env.PRISMA_GENERATE_ON_DEV = "true";
loadEnvFile();

const ok = runPrismaGenerateSafe();
process.exit(ok ? 0 : 1);
