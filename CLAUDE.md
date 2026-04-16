# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Structure

Two independent apps sharing a root `node_modules` (hoisted via root `package.json`):

- `api/` — Express 5 + TypeScript REST API (runs on port 5001)
- `www/` — Next.js 16 + React 19 + Tailwind CSS 4 frontend (runs on port 3001)

## Commands

### API (`cd api` or prefix with `api/`)

```bash
# Development
npm run dev          # node --watch with @swc-node/register (no compile step)

# Build & production
npm run build        # SWC compile to dist/
npm start            # node dist/index.js (requires .env)

# Test
npm test             # mocha src/**/*.test.ts
npm test -- --grep "pattern"  # run a single test

# Lint / format
npm run lint         # ESLint
npm run format       # oxfmt write
npm run format:check # oxfmt check (used in CI)

# Scripts (one-off DB scripts)
npm run script ./script/sync.ts   # runs arbitrary ts script with env loaded
npm run sync                       # shorthand for sync.ts
```

### WWW (`cd www` or prefix with `www/`)

```bash
npm run dev          # Next.js dev server on port 3001
npm run build
npm start
npm run lint
npm run format
npm run format:check
```

## Environment Setup

Copy sample files before first run:

```bash
cp api/.env.sample api/.env   # fill in MYSQL_DATABASE
cp www/.env.sample www/.env
```

Key values: `SERVER_PORT=5001`, `CLIENT_URL=http://localhost:3001`, `NEXT_PUBLIC_API_BASE_URL=http://localhost:5001`

## API Architecture

**Entry point**: `api/src/index.ts` → connects MySQL, starts HTTP server.

**App config**: `api/src/configs/app.ts` — Express middleware chain (helmet, morgan, body parsers, CORS with `envvars.clientUrl()`).

**Env vars**: All accessed via `api/src/configs/envvars.ts` — never read `process.env` directly elsewhere.

**Routing** (`api/src/routes/`):
- `GET /status` — DB health check (unauthenticated)
- `/auth` — signup, login, logout, current user
- `parseJwt` middleware applied globally after `/auth`
- `/admin` — gated by `validateRoles(['admin'])`; contains `/admin/users`

**Auth flow**: JWT stored as an HTTP-only cookie (`token`) in production; cookie is readable in dev. `parseJwt` populates `res.locals.user` (null on failure, never throws).

**Database**: `api/src/database/mysql/` — Sequelize + sequelize-typescript. Models live in `mysql/models/` and are auto-loaded at startup via `loader.ts` (dynamic import by filename). Adding a new model = add a `.ts` file to that directory; no registration needed.

**Error handling**: Use `throwHttpError(message, name, statusCode)` from `@/utils/error` to throw typed HTTP errors. The error middleware chain at the end of `app.ts` handles 404, logging, and JSON rendering.

**Validators**: `@/utils/validators` — `validateText`, `validateNumeric`, `validateArray` wrap express-validator. `validateAuth` and `validateRoles` guard routes.

**Path alias**: `@/` maps to `api/src/` (configured in tsconfig + SWC).

## WWW Architecture

**App Router** (Next.js 16): pages under `www/app/`.

**Global state**: `www/contexts/app-context.tsx` — `AppProvider` wraps the entire app. On mount it calls `GET /status` and `GET /auth` in parallel to populate `serverStatus` and `session`. Use `useAppContext()` to access `session.user`, `setSessionUser()`, `refreshBootData()`.

**API client**: `www/lib/api/client.ts` — axios instance with `withCredentials: true` pointed at `NEXT_PUBLIC_API_BASE_URL`. All API calls go through this client.

**Env**: `www/lib/env.ts` exposes `publicEnv.apiBaseUrl` (trims trailing slash). If unset, `AppProvider` short-circuits with an error state.

**Fonts**: IBM Plex Sans KR (body, `--font-body`) + Space Grotesk (display, `--font-display`), both from Google Fonts.

## Patterns to Follow

### Adding a new API resource

Follow the thin-route / service / model separation:

1. **Model** — add a new `.ts` file to `api/src/database/mysql/models/`. It is auto-loaded at startup; no registration needed. Override `toJSON()` to strip sensitive columns.
2. **Service** — add `api/src/services/<resource>.ts`. Put all business logic here; routes stay thin. Use Sequelize model methods directly (`User.findAll`, `User.create`, etc.).
3. **Route** — add `api/src/routes/<area>/<resource>.ts`, mount it in the parent `index.ts`. Use `validateText` / `validateNumeric` / `validateArray` for input, `throwHttpError` for errors, `getPaging` for paginated lists.

```ts
// Route shape to follow
router.get('/', validateRoles(['admin']), async (req, res) => {
  const { page, pageSize, offset, limit } = getPaging(req.query);
  const total = await countItems({});
  const items = await getItems({ offset, limit });
  res.json({ items, paging: { page, pageSize, total } });
});
```

### `res.locals.user` typing

`api/src/@types/express/index.d.ts` augments `Express.Locals` so `res.locals.user` is typed as `AuthUser | null` everywhere. Extend this file when adding new locals.

### Adding a new page (WWW)

Keep `app/*/page.tsx` thin — it only imports and renders the feature component:

```tsx
// app/some-page/page.tsx
import { SomePage } from '@/components/some-page/some-page';
export default function Page() { return <SomePage />; }
```

Put actual UI in `components/<feature>/<feature-page>.tsx` with `'use client'` at the top if it uses hooks or browser APIs.

### Adding a new API call (WWW)

Add a typed async function to `lib/api/<domain>.ts` and use `apiClient`:

```ts
// lib/api/posts.ts
import { apiClient } from '@/lib/api/client';
export async function fetchPosts() {
  const res = await apiClient.get<{ posts: Post[] }>('/posts');
  return res.data.posts;
}
```

### Auth & session

- Check `session.user` from `useAppContext()` for current user; call `setSessionUser()` after login/logout.
- Protected routes: check `res.locals.user` on the API; throw `throwHttpError('...', 'Auth', 401)`.
- Admin routes: wrap the router with `validateRoles(['admin'])`.

### SSE (Server-Sent Events)

`api/src/utils/index.ts` exports `streamHeader(req, res)` and `streamData(res, data)` — use these for any streaming endpoint.

### Code style

- **Import order**: `@/` path-alias imports come before third-party imports (oxfmt enforces this on save/CI).
- **Unused vars**: prefix with `_` (e.g., `_next`) to suppress the ESLint warning.
- **Filenames**: kebab-case in `www/`; camelCase/PascalCase in `api/`.
- **Named exports** for all components; default export only for Next.js page files.
- **Never read `process.env` directly** in API code — always go through `api/src/configs/envvars.ts`.
