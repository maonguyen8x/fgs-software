import { rmSync } from "node:fs";
import { resolve } from "node:path";
import { getRootDir } from "./process-utils.mjs";

const nextDir = resolve(getRootDir(), ".next");
try {
  rmSync(nextDir, { recursive: true, force: true });
  console.log("[clean] Removed .next cache");
} catch (error) {
  console.warn("[clean] Could not remove .next:", error);
}
