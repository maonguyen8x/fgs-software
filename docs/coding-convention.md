# FGS Software Website — Coding Conventions

> English-language standards for all contributors and AI assistants working on this project.

---

## 1. General Principles

| Rule | Description |
|------|-------------|
| **Data-driven UI** | Never hardcode business content (team, services, portfolio, stats, settings). Always fetch from PostgreSQL. |
| **Minimal scope** | Change only what the task requires. Avoid drive-by refactors. |
| **Type safety** | TypeScript strict mode; avoid `any`. Define interfaces in `src/types/` when shared. |
| **Consistency** | Match existing patterns for naming, file structure, and component style. |

---

## 2. Project Structure

```
src/
├── app/
│   ├── [locale]/          # Public i18n routes
│   ├── admin/             # Protected admin UI
│   └── api/               # Route handlers (validate + auth)
├── components/
│   ├── layout/            # Header, Footer, LanguageSwitcher
│   ├── sections/          # Page sections (Hero, Stats, etc.)
│   ├── chatbot/           # AI chat widget (client)
│   ├── ui/                # Reusable UI primitives
│   └── admin/             # Admin-only components
├── config/
│   ├── env.ts             # Zod-validated environment variables
│   └── api-routes.ts      # API path constants (no hardcoded URLs)
├── lib/
│   ├── api/response.ts    # Standard API success/error helpers
│   ├── security/          # sanitizeText, sanitizeEmail
│   ├── chat/              # AI context, prompts, providers
│   ├── db.ts              # Prisma singleton
│   ├── auth.ts            # NextAuth config
│   ├── logger.ts          # Structured server logging
│   └── ...
├── i18n/                  # next-intl routing config
├── types/                 # Shared TypeScript types
└── middleware.ts          # Locale + admin auth
scripts/
├── dev.mjs                # Cross-platform dev orchestrator
├── load-env.mjs           # Load .env + compose DATABASE_URL
├── wait-for-db.mjs        # Wait for PostgreSQL (Windows-safe)
├── run-dev-web.mjs        # Next.js dev server
└── run-dev-studio.mjs     # Prisma Studio
```

---

## 3. Naming Conventions

| Item | Convention | Example |
|------|------------|---------|
| Files (components) | PascalCase | `TeamGrid.tsx` |
| Files (utilities) | kebab-case or camelCase | `i18n-content.ts` |
| React components | PascalCase | `HeroSection` |
| Functions | camelCase | `getLocalizedField` |
| Constants | UPPER_SNAKE_CASE | `DEFAULT_LOCALE` |
| Prisma models | PascalCase singular | `TeamMember` |
| DB columns | camelCase | `titleJa`, `isVisible` |
| API routes | kebab-case folders | `/api/admin/team/[id]` |
| CSS | Tailwind utility classes | `bg-primary-600` |

# Coding rule:
- Use `const` before `let`, not `var`.
- Do not use `any` unless absolutely necessary; use `unknown` and type guard.
- Always declare the return type for public methods.
- Prefer `async/await` over `.then()/.catch()`.
- Use optional chaining `?.` and nullish coalescing `??`.
- Do NOT use `console.log`; use NestJS Logger or a custom logger service.
- Use destructuring to retrieve properties from objects/arrays.
- Use template literals instead of string concatenation.
- Use array methods (`map`, `filter`, `reduce`) instead of loops whenever possible.
- Only comment out source code when the logic is complex or unclear; avoid unnecessary comments. Use only English comments to maintain codebase consistency.
- Code should be clean, optimized, easy to read, and easy to scale—no explanatory comments are needed if the code is already clear. If the logic is complex, refactor it into a smaller function instead of lengthy comments.
- Code must be self-explanatory; avoid writing comments explaining what the code already clearly shows. If comments are necessary, focus on "why" rather than "what." If the logic is too complex, refactor it into a smaller function instead of lengthy comments.
- Code should be written in a way that others can understand immediately without needing to read comments.
- Eliminate redundant and unnecessary code.
- Function and variable names must be clear, meaningful, and accurately reflect their purpose.
- Avoid hardcoding values; use constants or configuration files.
- Data from the database or API must be validated and sanitized before rendering to the UI.
- Error messages (messages returned to the client) must be clear, contain no sensitive information, and be understandable to the end user.
- Error messages logged to the server must be detailed, have a stack trace, and contain no sensitive information.
- Error messages should be included in multilingual (i18n) files for easy multilingual support.
- UI text (button text, labels, placeholders, messages) should also be included in i18n files for easy multilingual support without hardcoding.
- Code must be free of logic or runtime errors and thoroughly tested before merging into the main branch.
- Linting tools (ESLint) and formatting tools (Prettier) should be used to ensure consistent code style throughout the codebase.
- Build commands and tests should be run before committing code to ensure no syntax or logic errors are included in the repository.
- API endpoints must be protected by authentication and authorization, preventing the exposure of sensitive data to unauthorized users.
- Best practices in security must be followed, such as avoiding SQL injection, XSS, CSRF, etc.
- API endpoints must declare URL constants in configuration files, not hardcode URLs directly in the code.
- API endpoints must validate input and handle errors appropriately, returning clear errors to the client without revealing sensitive information.
- Page and component names on the frontend must be clear, meaningful, and accurately reflect their functionality.
- Frontend components must be designed for reuse, avoiding duplicate code.
- Frontend components must be optimized for performance, avoiding unnecessary re-rendering, and using lazy loading whenever possible.
- Frontend components must be designed to be responsive, displaying well across various screen sizes.
- Frequently accessed data (sessions, tokens) should be stored in Redis to optimize speed, or the browser cache should be used for the frontend.
- Frontend API calls need to be optimized, avoiding unnecessary API calls, and using debounce/throttle whenever possible.
- Code must ensure security, prevent the exposure of sensitive information, and comply with security best practices.
- API endpoint URLs should not be hardcoded in the frontend code, but should be declared in configuration files or environment variables. This makes it easy to change the URL when deploying to different environments (development, staging, production) without having to modify the code.
- API endpoints need to validate input and handle errors appropriately, returning clear errors to the client without exposing sensitive information. This improves user experience and protects the system from attacks such as SQL injection, XSS, etc.
- Frontend components should be designed for reuse, avoiding duplicate code. This minimizes errors, improves maintainability, and speeds up development when new features are needed.
- Frontend components should be optimized for performance, avoiding unnecessary re-rendering and using lazy loading whenever possible. This improves the user experience.
- Frontend pages, components, and hooks should have clear, meaningful names that accurately reflect their function. This makes it easier for others to understand the purpose of each piece of code and improves maintainability.
- Source code should be hacker-proof, avoiding the disclosure of sensitive information, and adhering to security best practices. This protects the system from attacks and ensures security.
---

## 4. Internationalization (i18n)

### Static UI text
- Stored in `messages/en.json`, `messages/ja.json`, `messages/vi.json`
- Access via `useTranslations()` (client) or `getTranslations()` (server)
- **Never** embed user-visible labels as string literals in components

### Dynamic DB content
- English field is **required** (e.g. `title`, `description`)
- Optional: `titleJa`, `titleVi`, etc.
- Always resolve with:

```typescript
import { getLocalizedField } from "@/lib/i18n-content";
const title = getLocalizedField(item, "title", locale);
```

### Admin forms
- Use `LocaleTabs` component for EN / JA / VI fields
- Show missing-translation indicator when JA/VI empty

---

## 5. Database & Prisma

1. All schema changes go through `prisma/schema.prisma` + migrations (`yarn db:migrate`).
2. Use `prisma` singleton from `@/lib/db` — do not instantiate `PrismaClient` elsewhere.
3. Seed data lives in `prisma/seed.ts`; run with `yarn db:seed`.
4. Soft visibility: use `isVisible` boolean instead of deleting records when hiding from public site.
5. Ordering: use `order` integer field; always `orderBy: { order: "asc" }` in public queries.

---

## 6. API Routes

### Public (`/api/contact`)
- Zod validation on request body
- Rate limiting recommended in production
- Save to DB **and** send email
- Return generic error messages to clients (no stack traces)

### Admin (`/api/admin/*`)
- **Always** call `requireAdminSession()` first
- Zod validate input
- Return appropriate HTTP status: 400 (validation), 401 (auth), 500 (server)

```typescript
export async function POST(request: Request) {
  const { error } = await requireAdminSession();
  if (error) return error;
  // ...
}
```

---

## 7. Authentication & Security

| Topic | Rule |
|-------|------|
| Admin passwords | bcrypt hash, minimum 12 characters at creation |
| Session | JWT via NextAuth, 7-day max age |
| Env vars | `DATABASE_URL`, `NEXTAUTH_SECRET`, `RESEND_API_KEY` in `.env` only |
| Git | `.env` is gitignored; commit `.env.sample` with placeholders |
| Headers | Security headers configured in `next.config.ts` |
| Input | Sanitize/validate all user input; max length on text fields |
| XSS | Use React's default escaping; sanitize Markdown if rendering user HTML |
| CSRF | NextAuth SameSite cookies; avoid storing secrets in client state |

### Never commit
- `.env`, `.env.local`
- Database credentials
- API keys (Resend, Cloudinary, etc.)
- Production `NEXTAUTH_SECRET`

---

## 8. Styling & UI

1. **Primary color:** Blue palette (`primary-50` … `primary-950`) defined in `globals.css`.
2. Do **not** use inline hex colors — use Tailwind tokens.
3. Responsive: mobile-first; test at `sm`, `md`, `lg`, `xl` breakpoints.
4. Images: always `next/image` with `alt` text.
5. Links: always `next/link` for internal navigation.
6. Loading states: show on all form submissions.
7. Feedback: use Sonner toasts for success/error in client forms.

---

## 9. Components

- **Server Components by default** — fetch data in page/layout, pass props down.
- Add `"use client"` only when using hooks, browser APIs, or event handlers.
- Section components in `components/sections/` receive typed props — no direct Prisma calls inside presentation components.
- Keep components under ~200 lines; split if larger.

---

## 10. Error Handling

```typescript
try {
  // async operation
} catch (error) {
  console.error("Context:", error);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}
```

- Log errors server-side with context
- Never expose internal error details to API clients
- Use `notFound()` from `next/navigation` for missing DB records on detail pages

---

## 11. Git & Commits

- Commit messages: imperative mood, describe **why** not just what
- One logical change per commit when possible
- Do not commit `node_modules`, `.next`, or generated Prisma client artifacts beyond normal workflow

---

## 12. Testing & Quality

Before opening a PR:

```bash
yarn lint
yarn build
```

Target Lighthouse scores: 90+ for Performance, Accessibility, Best Practices, SEO.

---

## 13. Comments

- Write comments in **English**
- Comment **why**, not **what** — code should be self-explanatory
- Document non-obvious business rules (e.g. Japanese client communication expectations)

---

## 14. Package Manager

This project uses **Yarn** (not npm). Use `yarn install`, `yarn dev`, `yarn build`, etc.

- Lockfile: `yarn.lock` (commit this file)
- Config: `.yarnrc.yml` (`nodeLinker: node-modules`)
- Do not commit `package-lock.json`
- `yarn dev` starts PostgreSQL (Docker), Next.js, and Prisma Studio — see `scripts/dev.mjs`

---

## 15. AI Chatbot

- UI: `src/components/chatbot/ChatbotWidget.tsx` — client-only floating widget
- API: `POST /api/chat` — validates with Zod, persists to `ChatSession` / `ChatMessage`
- Knowledge: built from Prisma data in `src/lib/chat/context.ts` — never hardcode company facts in prompts
- OpenAI is optional; set `OPENAI_API_KEY` in `.env` for full AI replies
- Toggle via Settings: `chatbot_enabled`, `chatbot_name` (+ `_ja`, `_vi`)

---

## 16. Environment Setup Reference

```bash
cp .env.sample .env
# Edit DATABASE_URL, NEXTAUTH_SECRET, etc.
yarn install
yarn db:push
yarn db:seed
yarn dev
```

Admin login: credentials from `ADMIN_DEFAULT_EMAIL` / `ADMIN_DEFAULT_PASSWORD` in `.env`.

---

*Last updated: project initial release. Amend this document when conventions change.*
