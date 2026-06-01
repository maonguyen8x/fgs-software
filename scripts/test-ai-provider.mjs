/**
 * Quick local check: resolves AI provider and sends a minimal test prompt.
 * Usage: node scripts/test-ai-provider.mjs
 */
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env") });

const { PrismaClient } = await import("@prisma/client");
const prisma = new PrismaClient();

async function readEnvApiKey(type) {
  const keys =
    type === "openai"
      ? ["OPENAI_API_KEY", "OPENAI_KEY"]
      : type === "gemini"
        ? ["GOOGLE_AI_API_KEY", "GEMINI_API_KEY", "GOOGLE_API_KEY"]
        : ["ANTHROPIC_API_KEY"];
  for (const k of keys) {
    const v = process.env[k]?.trim();
    if (v && v.length >= 8 && !v.includes("•")) return v;
  }
  return null;
}

async function main() {
  const openai = await readEnvApiKey("openai");
  const gemini = await readEnvApiKey("gemini");
  console.log("Env keys present:", { openai: Boolean(openai), gemini: Boolean(gemini) });

  const rows = await prisma.aiProvider.findMany({ where: { isEnabled: true }, orderBy: { order: "asc" } });
  console.log("DB enabled providers:", rows.map((r) => ({ type: r.providerType, model: r.model, hasKey: Boolean(r.apiKey?.length >= 8) })));

  if (!openai && !gemini && rows.length === 0) {
    console.log("\nResult: FALLBACK mode — Nova will use rule-based replies, not OpenAI/Gemini.");
    console.log("Fix: set OPENAI_API_KEY or GOOGLE_AI_API_KEY in .env, then Admin → Settings → AI Providers → Import from .env");
    return;
  }

  const active = rows[0] ?? (openai ? { providerType: "openai", apiKey: openai, model: process.env.OPENAI_MODEL || "gpt-4o-mini" } : { providerType: "gemini", apiKey: gemini, model: process.env.GEMINI_MODEL || "gemini-2.0-flash" });
  console.log("\nTesting provider:", active.providerType, active.model);

  const prompt = "Reply with exactly: OK";
  if (active.providerType === "gemini") {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${active.model}:generateContent?key=${active.apiKey}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }] }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(JSON.stringify(json));
    const text = json.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    console.log("Gemini sample:", text.slice(0, 200));
  } else {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${active.apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: active.model,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 20,
      }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(JSON.stringify(json));
    console.log("OpenAI sample:", json.choices?.[0]?.message?.content?.slice(0, 200));
  }
  console.log("\nResult: AI provider OK — Nova should use real AI when this provider is active in app.");
}

main()
  .catch((e) => {
    console.error("Test failed:", e.message || e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
