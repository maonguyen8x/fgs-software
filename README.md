# FGS Software — Corporate Website

Multilingual corporate website for **FGS Software**, an IT outsourcing company in Vietnam serving Japanese and international clients. Built to showcase services, team, portfolio, and capture partnership inquiries.

## Features

- **Public site** (EN / JA / VI): Home, About, Services, Team, Portfolio, Blog, Contact
- **Dynamic content** from PostgreSQL — no hardcoded business data
- **Admin panel** (`/admin`): CRUD for team, services, works, blog; message inbox; site settings
- **Contact form** with email notifications (Resend) and database storage
- **AI Chatbot** — floating assistant with company knowledge from database (OpenAI optional)
- **SEO**: sitemap, robots.txt, metadata, hreflang-ready structure
- **AI Chatbot (Nova)**: floating assistant — knowledge from DB, OpenAI-powered when configured
- **Design**: Modern blue-themed UI with Framer Motion animations

## Tech Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS v4
- Prisma + PostgreSQL
- NextAuth.js (admin)
- next-intl (i18n)
- Resend (email)

## Prerequisites

- Node.js 18+
- [Yarn](https://yarnpkg.com/) 1.x (`npm install -g yarn`)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for local PostgreSQL via `yarn dev`), or a remote PostgreSQL instance ([Supabase](https://supabase.com), etc.)

## Installation

### 1. Clone and install dependencies

```bash
git clone <repository-url>
cd fgs-software
yarn install
```

### 2. Environment variables

Copy the sample file and fill in your values:

```bash
cp .env.sample .env
```

| Variable | Description |
|----------|-------------|
| `DB_HOST` | Database host (e.g. `localhost`) |
| `DB_PORT` | Database port (e.g. `5432`) |
| `DB_USERNAME` | Database user |
| `DB_PASSWORD` | Database password |
| `DB_NAME` | Database name |
| `DB_SCHEMA` | PostgreSQL schema (default `public`) |
| `DATABASE_URL` | Auto-composed from `DB_*` vars (used by Prisma) |
| `SKIP_DOCKER` | `true` when using your own PostgreSQL instead of Docker |
| `NEXTAUTH_SECRET` | Random string (min 32 chars) — `openssl rand -base64 32` |
| `NEXTAUTH_URL` | App URL, e.g. `http://localhost:3000` |
| `RESEND_API_KEY` | Resend API key for contact emails |
| `ADMIN_EMAIL` | Email receiving contact form submissions |
| `ADMIN_DEFAULT_EMAIL` | Initial admin login email (seed only) |
| `ADMIN_DEFAULT_PASSWORD` | Initial admin password (seed only) |
| `NEXT_PUBLIC_SITE_URL` | Public site URL for sitemap/emails |
| `OPENAI_API_KEY` | OpenAI key for Nova chatbot — **recommended** for accurate answers |
| `OPENAI_MODEL` | OpenAI model, default `gpt-4o-mini` |
| `GOOGLE_AI_API_KEY` | Google Gemini key (alternative to OpenAI) |
| `GEMINI_MODEL` | Gemini model, default `gemini-2.0-flash` |
| `AI_PROVIDER` | `openai` or `gemini` (optional) |
| `REDIS_URL` | Optional Redis for faster cached reads |

See [docs/chatbot-ai-setup.md](docs/chatbot-ai-setup.md) for chatbot architecture and provider setup.

| `ADMIN_LOGIN_PATH` | Secret slug to hide `/admin/login` — use `/access/{slug}` instead |
| `ADMIN_DEFAULT_EMAIL` / `ADMIN_DEFAULT_PASSWORD` | Initial admin account (see [docs/admin-access.md](docs/admin-access.md)) |

> **Security:** Never commit `.env` to Git. It is listed in `.gitignore`.

### 3. Database setup

```bash
yarn db:push      # Create tables
yarn db:seed      # Seed admin user, settings, sample content
```

### 4. Run all development services

```bash
yarn dev
```

This starts **all local services** in one command:

| Service | URL | Description |
|---------|-----|-------------|
| PostgreSQL | `localhost:5432` | Docker container (`docker-compose.yml`) |
| Next.js | [http://localhost:3000](http://localhost:3000) | Website + API |
| Prisma Studio | [http://localhost:5555](http://localhost:5555) | Database admin UI |

Press `Ctrl+C` to stop Next.js, Prisma Studio, and the PostgreSQL container.

**Windows note:** `yarn dev` uses Node scripts (not nested `yarn` + `wait-on` colons) to avoid path errors. Ensure PostgreSQL is running before `yarn dev`.

**Prisma EPERM on Windows:** If `prisma generate` fails with `EPERM` on `query_engine-windows.dll.node`, another Node process is locking the file. Close all other `yarn dev` terminals, then run `yarn dev` again. By default, `yarn dev` **skips** generate when the Prisma client already exists. After changing `schema.prisma`, run `yarn db:generate` once, or set `PRISMA_GENERATE_ON_DEV=true` in `.env`.

**Run services separately (optional):**

```bash
yarn dev:web      # Next.js only
yarn dev:studio   # Prisma Studio only
```

**Remote database (Supabase, etc.):** Add `SKIP_DOCKER=true` to `.env` and set `DATABASE_URL` to your hosted connection string. Then `yarn dev` starts only Next.js and Prisma Studio.

Open [http://localhost:3000](http://localhost:3000) — you will be redirected to `/en`, `/ja`, or `/vi` based on browser language.

**Admin panel:** [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

## Available Scripts

| Script | Description |
|--------|-------------|
| `yarn dev` | Start PostgreSQL (Docker) + Next.js + Prisma Studio |
| `yarn dev:down` | Stop PostgreSQL Docker container |
| `yarn build` | Production build |
| `yarn start` | Start production server |
| `yarn lint` | Run ESLint |
| `yarn db:generate` | Generate Prisma client |
| `yarn db:migrate` | Run Prisma migrations |
| `yarn db:push` | Push schema to DB (dev) |
| `yarn db:seed` | Seed database |
| `yarn db:studio` | Open Prisma Studio only |

## Project Structure

```
fgs-software/
├── docs/
│   ├── FGS-Software-Website-Spec.md   # Full product specification
│   └── coding-convention.md           # Coding standards
├── messages/                          # i18n JSON (en, ja, vi)
├── prisma/
│   ├── schema.prisma                  # Database schema
│   └── seed.ts                        # Initial data seed
├── public/
│   └── uploads/                       # User-uploaded files (gitignored contents)
├── src/
│   ├── app/
│   │   ├── [locale]/                  # Public pages
│   │   ├── admin/                     # Admin dashboard
│   │   └── api/                       # API routes
│   ├── components/
│   │   ├── layout/                    # Header, Footer
│   │   ├── sections/                  # Page sections
│   │   ├── ui/                        # UI primitives
│   │   ├── chatbot/                   # AI chat widget
│   │   └── admin/                     # Admin components
│   ├── i18n/                          # Locale routing config
│   └── lib/                           # db, auth, email, utils
├── .env.sample                        # Environment template
└── .github/copilot-instructions.md  # AI assistant guide
```

## Deployment

### Vercel (recommended)

1. Push repository to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add all environment variables from `.env.sample`
4. Connect production PostgreSQL (e.g. Supabase)
5. Run `yarn db:push` and `yarn db:seed` against production DB once

### Environment on Vercel

Set the same variables as `.env.sample`. Use a strong `NEXTAUTH_SECRET` and production `NEXTAUTH_URL` (your domain).

### Uploaded images (avatars, portfolio, logo)

Local dev without Cloudinary saves files under `public/uploads/`. **Vercel does not persist that folder.**

**Recommended: [Cloudinary](https://cloudinary.com)** — set on Vercel **and** locally:

```bash
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
```

1. Add the three variables in Vercel → **Settings → Environment Variables** (Production).
2. Redeploy, then **re-upload** images in Admin (old `/uploads/...` paths in Neon will not work until re-uploaded).
3. New files are stored as `https://res.cloudinary.com/...` URLs in the database.

Optional fallback: `BLOB_READ_WRITE_TOKEN` (Vercel Blob) if Cloudinary is not configured.

## Content Management

All dynamic content is managed via the admin panel:

| Section | Admin path |
|---------|------------|
| Team members | `/admin/team` |
| Services | `/admin/services` |
| Portfolio | `/admin/works` |
| Blog posts | `/admin/blog` |
| Contact messages | `/admin/messages` |
| AI chat conversations | `/admin/chat` |
| Site settings (hero, contact, SEO, chatbot) | `/admin/settings` |

Use **locale tabs** (EN / JA / VI) when editing translatable fields. Japanese and Vietnamese fields are optional — English is used as fallback.

## License

Proprietary — FGS Software. All rights reserved.
