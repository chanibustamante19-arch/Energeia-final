# Energeia

Energeia is a responsive React/Vite app for household electricity monitoring. It uses Supabase Authentication and Postgres with row-level security.

## Project structure

- `frontend/` — Vite application, pages, components, and browser-side Supabase client.
- `backend/supabase/migrations/` — database schema, constraints, RPCs, and RLS policies.
- `package.json` — root scripts and shared frontend dependencies.

## Supabase setup

1. Create a Supabase project.
2. Apply [`202611050001_initial_schema.sql`](./backend/supabase/migrations/202611050001_initial_schema.sql) in the Supabase SQL Editor, or use the Supabase CLI from the backend folder:

   ```bash
   cd backend
   npx supabase login
   npx supabase link --project-ref YOUR_PROJECT_REF
   npx supabase db push
   ```

3. In Supabase **Authentication → Providers**, enable Email for password-based accounts. Email addresses do not need to be Gmail addresses. You can also enable Google and configure its OAuth client credentials.
4. Add the Supabase callback URL (`https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`) to the OAuth provider's allowed redirect URIs.
5. In Supabase **Authentication → URL Configuration**, add the local and deployed app URLs as redirect URLs, including `http://localhost:5173/overview` and `https://YOUR_DOMAIN/overview`.
6. Copy `.env.example` to `.env.local` and set the project URL and publishable/anon key. Never put a Supabase service-role key in the frontend.

Google sign-in creates a profile and an initial household automatically. The schema enables RLS for profile, household, appliance/schedule, bill, reading, scenario, and dismissed-insight data. The app starts with empty records; add appliances, bills, and meter readings to populate estimates and charts.

## Local development

```bash
npm install
npm run dev
```

The app opens at `http://localhost:5173`. Without Supabase environment variables, the landing page remains available and sign-in explains the required setup.

## Deploy to Vercel

Import the repository with the repository root as the project root. Use:

- Framework preset: **Vite**
- Build command: `npm run build`
- Output directory: `frontend/dist`
- Install command: `npm install`

Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as Vercel environment variables for each environment. The included `vercel.json` sends browser routes to the Vite entry page.

## Checks

```bash
npm run lint
npm run typecheck
npm run build
```
