# Deploying the Brand Strategy Engine

The app is a Next.js app living in the `app/` folder. It needs two things in
production: a **Postgres database** and a **host**. **Vercel** is a good host
for it (it runs the Next.js server, API routes, and server actions) and its
free **Hobby** plan needs no credit card.

> The quickest free Postgres is **Neon** — also no credit card required.

The whole thing is ~10 minutes. You do not need to write any code.

---

## 1. Create the database (Neon — free)

1. Go to **https://neon.tech**, sign up, create a project.
2. Copy the **connection string** (looks like
   `postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require`). This is your
   `DATABASE_URL`.
3. Open Neon's **SQL Editor**, paste the entire contents of **`app/setup.sql`**,
   and run it. This creates all the tables and your login:
   - email: `sarakhaliid91@gmail.com`
   - password: `changeme123`  *(change this after your first sign-in)*

## 2. Pick an AUTH_SECRET

Any random 32+ character string. On a Mac/Linux terminal: `openssl rand -base64 32`.
Or just mash a long random string. Keep it private.

## 3. Deploy on Vercel (free, no credit card)

1. Go to **https://vercel.com**, sign up with your GitHub account — no card needed.
2. Click **Add New... → Project**, and import the repo
   **`sarakhaliid91/Brand-strategy-Engine`**.
3. In the import screen, set:
   - **Root Directory:** `app`   ← important, the app lives in this subfolder
   - **Framework Preset:** Next.js (Vercel detects this automatically)
4. Open **Environment Variables** and add:
   - `DATABASE_URL` = your Neon connection string
   - `AUTH_SECRET` = the string from step 2
   - *(optional, anytime later)* `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`,
     `AI_DEFAULT_PROVIDER`
5. Click **Deploy**. When it finishes, open the live `*.vercel.app` URL and sign in.

That's it — everything except the AI drafting works immediately. Add the AI keys
whenever you want Claude/ChatGPT drafting and competitor research to turn on.

---

## Notes

- **AI keys are optional for launch.** Without them, the manual sections, the
  wizard, the review screen, and navigation all work; the "Generate" buttons just
  show a friendly message until a key is added. To turn AI drafting on, add
  `OPENAI_API_KEY` (ChatGPT) and/or `ANTHROPIC_API_KEY` (Claude) in Vercel's
  Environment Variables and redeploy.
- **PDF export** works on Vercel via `@sparticuz/chromium` (serverless
  Chromium), with the local Playwright browser used in development. The
  exported PDF is fully branded: Thmanyah typefaces, green/black cover,
  RTL-aware layout.
- **`app/setup.sql`** is generated from the Drizzle schema
  (`app/src/lib/db/schema.ts`); regenerate with `npx drizzle-kit generate` if the
  schema changes.
