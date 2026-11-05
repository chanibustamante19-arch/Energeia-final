# Project instructions

## Project context

Energeia is a React/Vite frontend with Supabase Authentication and Postgres. Keep the frontend in `frontend/` and backend database work in `backend/supabase/`.

## Key files

- `frontend/src/`: pages, components, hooks, and browser-side Supabase client.
- `frontend/vite.config.js`: Vite root, `@/` alias, and React setup.
- `backend/supabase/migrations/`: versioned SQL schema and RLS policies.
- `.env.local`: local-only Supabase URL and publishable/anon key; never commit secrets.

## Working notes

- Apply database changes as migrations under `backend/supabase/migrations/`.
- The browser must use only the Supabase publishable/anon key; never expose a service-role key.
- Use Supabase Auth and row-level security for user-scoped data.
- Keep authentication, CRUD, and form errors visible to the user rather than silently falling back to sample data.
- Run the relevant checks from `package.json` before finishing code changes.
