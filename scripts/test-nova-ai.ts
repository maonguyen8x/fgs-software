/**
 * Direct AI provider smoke test (no HTTP server).
 * Run: npx tsx scripts/test-nova-ai.ts
 */
import { config } from "dotenv";
import { readEnvApiKey } from "../src/lib/ai/env-keys";
import { isUsableApiKey } from "../src/lib/ai/api-key";
import { generateOpenAIReply } from "../src/lib/chat/providers/openai";
import { generateGeminiReply } from "../src/lib/chat/providers/gemini";

config({ path: ".env" });

const TEST_QUESTIONS = [
  "Bạn là ai và có thể tư vấn gì cho tôi?",
  "FGS Software cung cấp những dịch vụ phát triển phần mềm nào?",
  "Tôi muốn trao đổi với team về một dự án web app.",
];

const SYSTEM = `You are Nova, AI assistant for FGS Software (Vietnam IT outsourcing).
Reply ONLY in Vietnamese. Be specific and helpful. Under 150 words.`;

type Provider = { type: "openai" | "gemini"; apiKey: string; model: string };

function resolveProviders(): Provider[] {
  const preferred = process.env.AI_PROVIDER?.replace(/"/g, "").trim().toLowerCase();
  const list: Provider[] = [];

  const openaiKey = readEnvApiKey("openai");
  const geminiKey = readEnvApiKey("gemini");
  const openaiModel = process.env.OPENAI_MODEL?.replace(/"/g, "") || "gpt-4o-mini";
  const geminiModel = process.env.GEMINI_MODEL?.replace(/"/g, "") || "gemini-2.5-flash";

  const add = (p: Provider | null) => {
    if (!p || !isUsableApiKey(p.apiKey)) return;
    if (!list.some((x) => x.type === p.type)) list.push(p);
  };

  if (preferred === "openai") add({ type: "openai", apiKey: openaiKey!, model: openaiModel });
  if (preferred === "gemini") add({ type: "gemini", apiKey: geminiKey!, model: geminiModel });

  add(openaiKey ? { type: "openai", apiKey: openaiKey, model: openaiModel } : null);
  add(geminiKey ? { type: "gemini", apiKey: geminiKey, model: geminiModel } : null);

  return list;
}

async function callProvider(provider: Provider, userMessage: string) {
  const messages = [{ role: "user" as const, content: userMessage }];
  if (provider.type === "openai") {
    return generateOpenAIReply(provider.apiKey, SYSTEM, messages, provider.model);
  }
  return generateGeminiReply(provider.apiKey, SYSTEM, messages, provider.model);
}

async function main() {
  const providers = resolveProviders();
  console.log(
    "Providers:",
    providers.map((c) => `${c.type} (${c.model})`).join(" → ") || "(none)"
  );

  if (providers.length === 0) {
    console.error("\nFAIL: No AI providers. Set OPENAI_API_KEY or GOOGLE_AI_API_KEY in .env");
    process.exit(1);
  }

  for (const q of TEST_QUESTIONS) {
    console.log(`\n--- Q: ${q}`);
    let answered = false;
    for (const provider of providers) {
      try {
        const reply = await callProvider(provider, q);
        console.log(`OK [${provider.type}] (${reply.length} chars):`);
        console.log(reply.slice(0, 450) + (reply.length > 450 ? "…" : ""));
        answered = true;
        break;
      } catch (e) {
        console.warn(`  ${provider.type} failed:`, String(e));
      }
    }
    if (!answered) {
      console.error("FAIL: All providers failed");
      process.exit(1);
    }
  }

  console.log("\nAll direct AI tests passed.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
