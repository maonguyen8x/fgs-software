# Admin Access Guide

## Login credentials

Admin uses **email + password** (not a separate username).

| Field | Source |
|--------|--------|
| Email | `ADMIN_DEFAULT_EMAIL` in `.env` |
| Password | `ADMIN_DEFAULT_PASSWORD` in `.env` |

These values are applied when you run `yarn db:seed` (first create only; existing users are not overwritten).

**Change the default password** before production.

## Login URLs

| Mode | URL |
|------|-----|
| Default | `{SITE_URL}/admin/login` |
| Hidden (recommended) | Set `ADMIN_LOGIN_PATH` in environment variables, then use `{SITE_URL}/access/{ADMIN_LOGIN_PATH}` |

Example (use your **own** secret slug — do not commit the real value to Git):

```env
ADMIN_LOGIN_PATH="your-private-secret-slug"
NEXT_PUBLIC_ADMIN_LOGIN_PATH="your-private-secret-slug"
```

- Minimum **8 characters** for `ADMIN_LOGIN_PATH`
- Set the same values in **Vercel → Settings → Environment Variables** for Production (and Preview if needed)
- `/admin/login` returns **404** when `ADMIN_LOGIN_PATH` is set
- No admin link on the public website header
- `/admin/` and `/access/` are blocked in `robots.txt`

**Security:** Store the real login path only in `.env` (local) and Vercel env vars. Do not put the production slug in markdown, README, or commit messages. Share the URL only with administrators.

## After login

Dashboard: `/admin/dashboard`

## News RSS imports

Open **Admin → News**, add up to 10 public HTTPS RSS/Atom feed URLs (one per line), and select **Save feeds**. Use **Sync RSS now** to import new entries. The importer keeps a short excerpt and the original source link, skips entries without an image, and saves every imported article as **pending**; it will not appear publicly until an administrator approves it. Only configure feeds whose terms permit reusing their excerpts and images.

RSS imports are on-demand. This project does not configure a recurring scheduler or a machine-token endpoint; scheduled imports need a hosting-specific cron integration.
