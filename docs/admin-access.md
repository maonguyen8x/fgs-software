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
| Default | `http://localhost:3000/admin/login` |
| Hidden (recommended) | Set `ADMIN_LOGIN_PATH` in `.env`, then use `/access/{ADMIN_LOGIN_PATH}` |

Your project `.env` includes:

```env
ADMIN_LOGIN_PATH="fgs-portal-fgs-2026"
```

**Admin login URL (local):** [http://localhost:3000/access/fgs-portal-fgs-2026](http://localhost:3000/access/fgs-portal-fgs-2026)

Change `ADMIN_LOGIN_PATH` to any secret string (minimum 8 characters) before production.

- `/admin/login` returns **404** (not discoverable)
- No admin link on the public website header
- `/admin/` and `/access/` are blocked in `robots.txt`

Share the secret URL only with system administrators.

## After login

Dashboard: `/admin/dashboard`
