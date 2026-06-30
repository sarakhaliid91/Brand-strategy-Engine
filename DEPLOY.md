# Deploying the Brand Strategy Engine

The app is a Next.js app living in the `app/` folder. It needs two things in
production: a **Postgres database** and a **host**. Firebase **App Hosting** is a
good host for it (it runs the Next.js server, API routes, and server actions).

> Note: Firebase's own database (Firestore) is **not** used by this app — it uses
> Postgres. The quickest free Postgres is **Neon**; you can also use GCP Cloud SQL.

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

## 3. Deploy on Firebase App Hosting

1. Go to the **Firebase console → App Hosting → Get started / Create backend**.
2. Connect your GitHub and pick the repo **`sarakhaliid91/Brand-strategy-Engine`**.
3. Set:
   - **Live branch:** `claude/brand-strategy-engine-6wp26e` (or merge it to `main` first)
   - **Root directory:** `app`   ← important, the app lives in this subfolder
4. Add **environment variables / secrets**:
   - `DATABASE_URL` = your Neon connection string
   - `AUTH_SECRET` = the string from step 2
   - *(optional, anytime later)* `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`,
     `AI_DEFAULT_PROVIDER`
5. Deploy. When it finishes, open the live URL and sign in.

That's it — everything except the AI drafting works immediately. Add the AI keys
whenever you want Claude/ChatGPT drafting and competitor research to turn on.

---

## Notes

- **AI keys are optional for launch.** Without them, the manual sections, the
  wizard, the review screen, and navigation all work; the "Generate" buttons just
  show a friendly message until a key is added.
- **PDF export** uses headless Chromium. On a serverless/container host it needs
  the `@sparticuz/chromium` package wired into the export route — a small
  follow-up. Everything else runs as-is. (It works fully when running locally.)
- **`app/setup.sql`** is generated from the Drizzle schema
  (`app/src/lib/db/schema.ts`); regenerate with `npx drizzle-kit generate` if the
  schema changes.
