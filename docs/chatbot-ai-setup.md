# Nova Chatbot — AI Setup Guide

Nova uses **real large language models** (Google Gemini 2.0 Flash or OpenAI). Answers are generated from live company data in the database — there is **no hardcoded Q&A** in application code.

Without a valid API key, Nova returns `AI_UNAVAILABLE` and directs users to the Contact page.

## Recommended: Gemini 2.0 Flash (free tier)

1. Create an API key at [Google AI Studio](https://aistudio.google.com/apikey)
2. Add to `.env`:

```env
GOOGLE_AI_API_KEY=your-key-here
GEMINI_MODEL=gemini-2.0-flash
AI_PROVIDER=auto
```

## OpenAI (optional)

```env
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
```

Requires billing/quota on your OpenAI account.

## Architecture

| Layer | Purpose |
|--------|---------|
| **PostgreSQL** | Services, works, settings, team — source of truth |
| **System prompt + context** | Inject live company data into each AI request (`buildCompanyKnowledge`) |
| **Gemini / OpenAI / Anthropic** | Natural language understanding and replies in the site locale |
| **Next.js cache + Redis** | Fast reads; optional `REDIS_URL` |

## Provider priority

```
AI_PROVIDER=auto    → Gemini → OpenAI → Anthropic (recommended)
AI_PROVIDER=gemini  → Gemini first, then others if Gemini fails
AI_PROVIDER=openai  → OpenAI first, then others if OpenAI fails
```

## Admin setup

1. **Admin → Settings → AI Providers**
2. Click **Import from .env**
3. Use **Test connection**

## Verify locally

```bash
npx tsx scripts/test-nova-ai.ts
node scripts/test-nova-chat.mjs   # requires dev server on :3000
```

## Troubleshooting

| Symptom | Fix |
|--------|-----|
| `AI_UNAVAILABLE` | Add `GOOGLE_AI_API_KEY` or fix OpenAI billing |
| OpenAI `insufficient_quota` | Use Gemini free tier or top up OpenAI |
| Wrong/generic answers | Update admin content; re-import .env keys |

## Security

- API keys stay server-side (`.env` / admin DB only)
- Chat runs via `/api/chat` — never expose keys to the browser
