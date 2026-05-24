# Nova Chatbot — AI Setup Guide

## Why answers feel generic

Without an AI API key, Nova uses a **rule-based fallback** (keyword matching + company knowledge snippets). It cannot truly understand free-form questions like *"Bạn là ai? bạn có thể tư vấn gì?"* the way a large language model can.

For accurate, flexible answers you should enable **OpenAI** or **Google Gemini**.

## Recommended approach

| Layer | Purpose |
|--------|---------|
| **PostgreSQL** | Services, works, settings, team — source of truth |
| **System prompt + RAG context** | Inject live company data into each AI request (`buildCompanyKnowledge`) |
| **OpenAI or Gemini** | Natural language understanding and replies in the site locale |
| **Next.js `unstable_cache` + Redis** | Fast reads; optional `REDIS_URL` for multi-instance deployments |

### OpenAI (recommended default)

1. Create an API key at [platform.openai.com](https://platform.openai.com).
2. Add to `.env`:

```env
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
AI_PROVIDER=openai
```

Cost-effective models: `gpt-4o-mini`, `gpt-4.1-mini`.

### Google Gemini (alternative)

1. Create an API key in [Google AI Studio](https://aistudio.google.com/apikey).
2. Add to `.env`:

```env
GOOGLE_AI_API_KEY=...
GEMINI_MODEL=gemini-2.0-flash
AI_PROVIDER=gemini
```

If both keys exist and `AI_PROVIDER` is unset, **OpenAI is preferred**, then Gemini, then fallback.

## Provider priority

```
AI_PROVIDER=openai  → OpenAI only (if key present)
AI_PROVIDER=gemini  → Gemini only (if key present)
(unset)             → OpenAI → Gemini → fallback
```

## Improving answer quality

1. Keep **admin content** up to date (services, works, settings) — the AI only knows what is in the knowledge base.
2. Use a capable model for complex sales questions (`gpt-4o` or `gemini-2.0-flash`).
3. Do **not** hardcode Q&A in code; extend the database and let `buildCompanyKnowledge` include new sections.

## Redis (optional)

```env
REDIS_URL=redis://localhost:6379
```

Caches frequent reads for 5 minutes and clears on admin save. Works without Redis (Next.js cache only).

## Security

- Never expose API keys to the browser; chat runs server-side via `/api/chat`.
- Keys stay in `.env` only (not committed).
