<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Commands

```bash
npm run dev            # next dev (turbopack)
npm run lint           # eslint (flat config, no args -> whole repo)
npx tsc --noEmit       # there is NO typecheck script; use this
```

No test framework, no formatter, no CI. Never invent `npm test` / `npm run typecheck`.

**Broken baseline (do not treat as your regression):** `npx tsc --noEmit` fails with 2 errors
(`NoteEntityType` undefined in `src/components/venture-manager/StartupDetailClient.tsx:50,54`);
`npm run lint` reports ~42 errors / ~57 warnings. Re-check that your change did not add to the counts.

Env comes from `.env` (gitignored): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`SUPABASE_SERVICE_ROLE_KEY`. Note the untracked `env.local` at the repo root is **not** a Next.js
env file and is never loaded — `.env` is the live one.

## Layout

- `app/` at the **repo root** (not `src/app`), plus `src/proxy.ts`.
- `src/` holds everything else: `components/<domain>/`, `features/<domain>/actions.ts`,
  `lib/<domain>/`, `types/index.ts`. Alias `@/*` -> `src/*` (see `tsconfig.json`).
- Client/server split is by file convention already used: `*-Client.tsx` = `'use client'`,
  `actions.ts` = `'use server'`. Follow the neighbour.

## Auth & roles — enforcement is NOT where it looks

- Roles live in Postgres `profiles.role` CHECK constraint: `ADMIN | FOUNDER | STAFF | VENTURE_MANAGER`
  (`src/types/index.ts`). RLS is the real security boundary; the app layer is only UX gating.
- `src/proxy.ts` (Next 16's rename of `middleware.ts`) contains the auth redirect logic but **is not
  registered**: Next expects `proxy.ts` beside `app/`, i.e. at the repo root. Verified via the empty
  `middleware` array in `.next/dev/server/middleware-manifest.json`. It is currently dead code.
- Actual route protection = `requireRole()` helpers in `src/lib/auth/requireRole.ts`, called at the
  top of each role `app/*/layout.tsx` (e.g. `app/admin/layout.tsx` -> `requireAdmin()`). New role
  surface must be gated there; a page without a guarded layout is publicly reachable.
- `/tv`, `/tv/*` and `/api/*` are intentionally unauthenticated (see below).

## Supabase clients

- `src/lib/supabase/server.ts` — RSC + server actions. RLS applies. Cookie writes are wrapped in
  try/catch because Server Components cannot set cookies.
- `src/lib/supabase/client.ts` — `'use client'` browser client.
- `src/lib/supabase/admin.ts` — **service role, bypasses RLS.** Only for TV telemetry
  (`src/lib/tv/telemetry.ts`), which serves public `/tv` screens. Never import it from anything
  user-authenticated; there is no RLS backstop there.

## Server actions

`features/*/actions.ts` all follow one shape: `'use server'`, signature
`(prevState: ActionState, formData: FormData) => Promise<ActionState>`, a local `zod` schema parsed
via `safeParse` (return `{ error: firstMessage }`), an explicit `auth.getUser()` null-check, then
`revalidatePath` and `logActivity`. Do not add REST route handlers for mutations.

## Migrations

`supabase/migrations/NNN_snake_name.sql`, plain SQL, applied by hand in the Supabase SQL editor.
No `supabase/config.toml`, no CLI, no seed runner.

- Filenames collide (`002_realtime_telemetry_events.sql` and `002_rls_policies.sql`) — ordering is by
  filename, so pick a number that sorts after existing ones and don't rely on a migration tool.
- Adding a role = drop/re-add `profiles_role_check` (see `008_venture_manager_role_and_notes.sql`).
- New table ⇒ write RLS policies in the same migration.
- `003_admin_seed.sql` is instructions, not executable seed: create the user in the Supabase
  dashboard, then `INSERT` a matching `profiles` row.

## TV dashboards (event-driven, mostly demo data)

- `telemetry_events` table + `notify_telemetry_event()` trigger fan out changes from
  `tasks`/`weekly_plans`/`domains`/`activity_logs`; `CompanyTvDisplay` subscribes via Realtime
  (plus a 10-minute fallback heartbeat — do not reintroduce polling).
  A new table that should refresh the wall needs a trigger added in a new migration.
- `src/lib/tv/telemetry.ts` mixes real DB metrics with hardcoded per-company demo profiles
  (bare logic / apex / chava) and **synthesizes sample tasks when a startup has zero tasks**.
  `src/components/tv-dashboards/*` still read `src/lib/tv-dashboards/mockData.ts`.
  Numbers on the TV wall are therefore not a bug report surface — don't "fix" them from the DB alone.
- Root-level `refactor.js` / `fix_footers.js` are one-off codemods from past refactors
  (`refactor.js` has a hardcoded `/Users/sourav/...` path). Treat as dead history, not tooling.