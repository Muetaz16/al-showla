# Deployment (Railway)

Railway auto-detects this Next.js app (Nixpacks) and runs:

- **Build:** `npm run build` → `prisma generate && next build`
- **Start:** `npm start` → `prisma db push || echo 'schema sync skipped'; next start -H 0.0.0.0 -p ${PORT:-3000}`

The start command binds to `0.0.0.0` and uses Railway's injected `$PORT`. `prisma db push` syncs the
database schema on boot; if the DB is temporarily unreachable it is skipped (the app still boots — product
data falls back to the built-in catalog).

## Required environment variables (set these in the Railway dashboard → Variables)

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | **Yes** | PostgreSQL connection string (Railway Postgres or Neon). Without it, DB-backed features are disabled but the site still serves the static catalog. |
| `NEXTAUTH_SECRET` | Yes (if using NextAuth login) | Random 32+ char secret. |
| `NEXTAUTH_URL` | Yes (if using NextAuth) | The public site URL, e.g. `https://your-app.up.railway.app`. |
| `NEXT_PUBLIC_SITE_URL` | Recommended | Public site URL, used for SEO canonical/OG tags. |

## Optional

| Variable | Purpose |
|---|---|
| `GEMINI_API_KEY` | Enables the AI Technical Advisor (`/advisor`). Get one from https://aistudio.google.com. If empty, the advisor falls back to a rule-based catalog assistant. |
| `GEMINI_MODEL` | Overrides the Gemini model (default `gemini-2.0-flash`). |
| `NEXT_PUBLIC_GA_ID` | Google Analytics ID. |
| `NEXT_PUBLIC_FB_PIXEL_ID` | Facebook Pixel ID. |
| `ERP_API_KEY` | Protects `GET /api/erp/orders`. |

## Notes

- `.env*` files are gitignored — set all secrets in Railway, not in the repo.
- Node 20+ is required (see `engines` in package.json).
- Puppeteer / the local PDF and seed scripts are **dev-only** and are not needed at runtime.
