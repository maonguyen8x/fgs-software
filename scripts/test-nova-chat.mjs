/**
 * Quick Nova chatbot smoke test — run: node scripts/test-nova-chat.mjs
 * Requires dev server on PORT (default 3000) or set BASE_URL.
 */
import { randomUUID } from "crypto";

const BASE = process.env.BASE_URL || "http://localhost:3000";

const questions = [
  { locale: "vi", message: "Bạn là ai và có thể tư vấn gì cho tôi?" },
  { locale: "vi", message: "FGS Software cung cấp những dịch vụ phát triển phần mềm nào?" },
  { locale: "vi", message: "Tôi muốn trao đổi với team về một dự án web app." },
];

async function ask(sessionId, locale, message) {
  const res = await fetch(`${BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, locale, message }),
  });
  const data = await res.json();
  return { status: res.status, data };
}

async function main() {
  const sessionId = randomUUID();
  console.log(`Testing Nova at ${BASE} (session ${sessionId.slice(0, 8)}…)\n`);

  for (const q of questions) {
    console.log(`--- Q [${q.locale}]: ${q.message}`);
    try {
      const { status, data } = await ask(sessionId, q.locale, q.message);
      if (status !== 200) {
        console.log(`FAIL HTTP ${status}:`, JSON.stringify(data, null, 2));
      } else {
        const reply = data.data?.reply ?? data.reply ?? "(no reply field)";
        console.log(`OK (${reply.length} chars):`, reply.slice(0, 280) + (reply.length > 280 ? "…" : ""));
      }
    } catch (e) {
      console.log("ERROR:", e.message);
    }
    console.log();
  }
}

main();
