# AGENTS.md

This file provides guidance to AI Agents when working with code in this repository.

> Each app has its own detailed guide — read the relevant README before making changes:
>
> - [`api/README.md`](api/README.md) — API architecture, domain rules, code conventions
> - [`www/README.md`](www/README.md) — WWW architecture, component patterns, styling

## Repository Structure

A backend and a front-end apps sharing a root `node_modules` (hoisted via root `package.json`):

- `api/` — Express 5 + TypeScript REST API (runs on port 5001)
- `www/` — Next.js 16 + React 19 + Tailwind CSS 4 frontend (runs on port 3001)
- `shared/` — type-only package shared by both apps (`import type { ... } from 'shared'`). Never export runtime values from it — there is no build step, so value imports break the compiled api output.

Git hooks (husky) live at the root `.husky/` and run `format:check`, `lint`, `typecheck` on pre-commit. CI (`.github/workflows/ci.yml`) runs format:check → lint → typecheck → test → build.

## Commands

### API (`cd api` or prefix with `api/`)

```bash
npm run dev                      # node --watch with @swc-node/register (no compile step)
npm run build                    # SWC compile to dist/
npm start                        # node dist/index.js (requires .env)
npm test                         # mocha src/**/*.test.ts
npm test -- --grep "pattern"     # run a single test
npm run lint                     # ESLint
npm run typecheck                # tsc --noEmit (swc build does NOT type-check)
npm run format                   # oxfmt write
npm run format:check             # oxfmt check (used in CI)
npm run script ./script/sync.ts  # runs arbitrary ts script with env loaded
npm run sync                     # shorthand for sync.ts
```

### WWW (`cd www` or prefix with `www/`)

```bash
npm run dev                       # Next.js dev server on port 3001
npm run build                     # Build for production
npm start                         # Start production server
npm run lint                      # ESLint
npm run typecheck                 # tsc --noEmit
npm run format                    # oxfmt write
npm run format:check              # oxfmt check (used in CI)
```

## Environment Setup

Copy sample files before first run:

```bash
cp api/.env.sample api/.env   # fill in MYSQL_DATABASE
cp www/.env.sample www/.env
```

## Cross-App Patterns

### Auth flow (API ↔ WWW)

- **API side**: JWT stored as http-only secure cookie (`token`). `parseJwt` middleware populates `res.locals.user` (null on failure, never throws). Protected routes use `validateAuth` or `validateRoles(['admin'])`.
- **WWW side**: `AppProvider` calls `GET /auth` on mount to populate `session.user`. After login/logout, call `setSessionUser()` from `useAppContext()`. The axios client sends cookies automatically (`withCredentials: true`).

### SSE (Server-Sent Events)

`api/src/utils/index.ts` exports `streamHeader(req, res)` and `streamData(res, data)` — use these for any streaming endpoint.

### Code style (shared)

- **Path alias**: `@/` maps to `src/` (api) or project root (www).
- **Import order**: `@/` path-alias imports come before third-party imports (oxfmt enforces this on save/CI).
- **Unused vars**: prefix with `_` (e.g., `_next`) to suppress the ESLint warning.
- **Arrow functions**: always use arrow functions (`const fn = () => {}`) instead of `function` declarations. Exception: class methods use standard method syntax.
- **Named exports** for all components; default export only for Next.js page files.
