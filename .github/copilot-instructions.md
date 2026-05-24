# FGS Software Website — Copilot Instructions

## Project Overview

This repository contains the **FGS Software** corporate website — a multilingual (English, Japanese, Vietnamese) marketing and lead-generation platform for an IT outsourcing company targeting Japanese clients and partners.

**Business goal:** Present company capabilities, team, portfolio, and services to attract outsourcing projects and partnership inquiries.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) + TypeScript |
| Styling | Tailwind CSS v4 + custom primary blue design tokens |
| UI | shadcn-style Radix components |
| Database | PostgreSQL via Prisma ORM |
| Auth | NextAuth.js (Credentials + JWT, 7-day session) |
| i18n | next-intl (`/en`, `/ja`, `/vi` URL prefixes) |
| Email | Resend API (contact form notifications) |
| Animation | Framer Motion |

## Architecture Rules

1. **Never hardcode dynamic content** — All public-facing business data (team, services, works, blog, stats, settings, testimonials) must come from PostgreSQL via Prisma.
2. **Use `getLocalizedField()`** from `@/lib/i18n-content` for DB fields with `*Ja` and `*Vi` suffixes; English is the required fallback.
3. **Static UI labels** live in `messages/en.json`, `messages/ja.json`, `messages/vi.json` — not in components as literal strings.
4. **Validate all API inputs** with Zod schemas.
5. **Protect admin routes** — `/admin/*` (except login) via middleware JWT check; `/api/admin/*` via `requireAdminSession()`.
6. **Secrets** — Only in `.env` (copied from `.env.sample`); never commit `.env`.

## Key Paths

```
src/app/[locale]/          # Public pages (i18n)
src/app/admin/             # Admin dashboard (protected)
src/app/api/contact/       # Public contact form
src/app/api/admin/         # Protected CRUD APIs
prisma/schema.prisma       # Database schema
messages/                  # i18n JSON files
docs/coding-convention.md  # Full coding standards
```

## Primary Color

Blue (`primary-500` → `#3b82f6`) is the brand color. Use Tailwind `primary-*` tokens from `globals.css`, not arbitrary hex in components.

## Common Tasks

- **Add content:** Use Admin Panel at `/admin` or run `yarn db:seed` for initial data.
- **DB changes:** Edit `prisma/schema.prisma` → `yarn db:migrate` → update seed if needed.
- **Local dev:** `yarn dev` starts PostgreSQL (Docker), Next.js, and Prisma Studio together.
- **Chatbot:** `ChatbotWidget` on public layout; `/api/chat` uses DB knowledge + optional `OPENAI_API_KEY`.
- **New public page:** Add under `src/app/[locale]/`, fetch from Prisma in Server Component, add nav link in `Header.tsx` and message keys.

## Do Not

- Use `any` type without justification
- Hardcode company name, hero text, team, or services in JSX
- Commit `.env`, credentials, or API keys
- Skip Zod validation on API routes
- Use `<img>` — use `next/image` instead

See `docs/coding-convention.md` and `docs/FGS-Software-Website-Spec.md` for complete requirements.
