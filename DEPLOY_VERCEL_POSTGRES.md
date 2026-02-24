# Deploy to Vercel with Postgres (Sprint 1)

This project uses **Prisma** + **Postgres**.

## Option A (recommended): Neon
1. Create a Neon project + database.
2. Copy the connection string (must be SSL):
   - `postgresql://USER:PASSWORD@HOST/DB?sslmode=require`

## Option B: Supabase
1. Create a Supabase project.
2. Get the connection string from Project Settings → Database.
3. Use the **connection pooler** string for serverless environments (recommended).

---

## Vercel environment variables
Set these in Vercel → Project → Settings → Environment Variables:

- `DATABASE_URL`
  - Example (Neon):
    - `postgresql://USER:PASSWORD@HOST/DB?sslmode=require`
  - Example (Supabase pooler):
    - `postgresql://USER:PASSWORD@HOST:6543/postgres?sslmode=require&pgbouncer=true`

- `SESSION_PASSWORD`
  - **Required**. Long random string, 32+ characters.
  - Used to encrypt/sign the session cookie.

- `NEXT_PUBLIC_BASE_URL`
  - Example: `https://YOURPROJECT.vercel.app`
  - Used only for logout redirect.

---

## Apply migrations (Prisma)
Run this locally (or in CI) **after** DATABASE_URL points to the new Postgres DB:

```bash
cd uplineai
export DATABASE_URL='...'

# generates client
npx prisma generate

# apply existing migrations to the Postgres DB
npx prisma migrate deploy
```

Notes:
- We already have migrations under `prisma/migrations/*`.
- `migrate deploy` is the correct command for non-dev environments.

---

## Local dev with Postgres
1. Put your Postgres connection string into `uplineai/.env`.
2. Then:

```bash
cd uplineai
npx prisma generate
npx prisma migrate dev
npm run dev
```
