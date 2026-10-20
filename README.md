# LinePal 💜

A 100% free, gamified calorie & macro tracker PWA with an AI food scanner and
**Kooky**, a purple bunny companion (BTS ARMY themed — Borahae!).

Works out of the box in **guest mode** (no setup, data saved to your browser).
Add free API keys to unlock AI food scanning and cross-device sync.

## Stack (all free tier)

- **Next.js 16** (App Router) + React 19 + Tailwind CSS 4
- **Framer Motion** for the mascot animations and bottom sheets
- **Supabase** (free Postgres + Auth + Storage) — optional, falls back to `localStorage`
- **Google Gemini** (`@google/genai`, free via Google AI Studio) — optional, powers the photo scanner
- Hand-rolled service worker + manifest for installable iOS/Android PWA support

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000 (or whatever port it prints) on your phone or in
Chrome DevTools' device toolbar. The app works immediately in **guest mode**:
demo data is seeded, and everything you log is saved to `localStorage`.

## Unlocking the AI food scanner (free)

1. Go to https://aistudio.google.com/apikey and create a free API key.
2. Copy `.env.example` to `.env.local` and set:
   ```
   GEMINI_API_KEY=your-key-here
   ```
3. Restart `npm run dev`. The camera/photo scanner and "Estimate with AI"
   quick-log button will now call `gemini-3.8-flash` for structured nutrition
   estimates. Without a key, the app shows a friendly message and you can
   still log meals manually.

## Unlocking accounts + cross-device sync (free)

1. Create a free project at https://supabase.com.
2. In the Supabase dashboard, open **SQL Editor** and run the contents of
   [`supabase/schema.sql`](supabase/schema.sql). This creates the `meals`,
   `weight_logs`, `water_logs`, `fasting_sessions`, and `profiles` tables with
   row-level security (every user only ever sees their own rows), plus a
   public `food-photos` storage bucket for scanned meal photos.
3. In **Project Settings → API**, copy the Project URL and `anon` public key
   into `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   ```
4. Restart the dev server. The **Progress** tab will now show a "Sign in"
   link — create an account and your meals, water, weight, and fasting
   history sync to Postgres instead of `localStorage`.

Without Supabase configured, the app runs fully in guest mode — nothing is
disabled, data just stays on-device.

## Installing as an iPhone app

1. Deploy the app (e.g. to Vercel's free tier) or run it on your phone's
   network IP during development.
2. Open the URL in **Safari** on iOS.
3. Tap the Share icon → **Add to Home Screen**.
4. Launch it from the Home Screen — it runs full-screen with no browser
   chrome, using the icons and theme color from `public/manifest.json`.

## Project structure

```
app/                  Routes: dashboard, history, fasting, progress, login, API
components/           UI building blocks (mascot, rings, sheets, cards)
context/              AppDataContext — single source of truth (Supabase or localStorage)
lib/                  Types, Supabase clients, Gemini client, mascot mood logic
supabase/schema.sql   Full Postgres schema + RLS policies
scripts/              Procedural PNG icon generator (no image deps needed)
```

## Deploying for free

Vercel's free Hobby tier works well for this stack:

```bash
npx vercel
```

Add the same environment variables (`GEMINI_API_KEY`,
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) in the Vercel
project settings. No paid tier is required for personal use.
