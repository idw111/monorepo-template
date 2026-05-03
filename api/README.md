# Agent Guide — api

> Express 5 + TypeScript REST API with Sequelize (MySQL).

## 1. Project Structure

```
src/
├── @types/             # Express type augmentations (res.locals.user typing)
├── configs/            # envvars.ts (env access), app.ts (Express middleware)
├── database/
│   └── mysql/
│       ├── index.ts    # connect(), getSequelize()
│       └── models/     # One file per Sequelize model (auto-loaded)
├── routes/             # Express routers (thin controller layer)
├── services/           # Business logic
├── utils/              # Shared helpers (error, validators, paging, etc.)
└── index.ts            # Entry point — connects DB, starts HTTP server
```

## 2. Architecture

### Entry point

`src/index.ts` → dynamic-imports `configs/app`, `configs/envvars`, `database/mysql` → connects MySQL → starts HTTP server. Handles graceful shutdown on SIGINT/SIGTERM.

### App config (`src/configs/app.ts`)

Express middleware chain: helmet → morgan → body parsers → cookie-parser → compression → CORS (`envvars.clientUrl()`) → routes → error handlers (404 → report → render).

### Env vars (`src/configs/envvars.ts`)

All environment variables are validated with Zod on startup. **Never read `process.env` directly** — always import `envvars` from `@/configs/envvars`.

Adding a new variable:

1. Add to `.env` and `.env.sample`
2. Add to the Zod schema and return object in `envvars.ts`

### Routing (`src/routes/`)

- `GET /status` — DB health check (unauthenticated)
- `/auth` — signup, login, logout, current user
- `parseJwt` middleware applied globally after `/auth`
- `/admin` — gated by `validateRoles(['admin'])`; contains `/admin/users`

### Database (`src/database/mysql/`)

Sequelize + sequelize-typescript. Models in `mysql/models/` are **auto-loaded at startup** via `loader.ts` (dynamic import by filename). Adding a new model = add a `.ts` file to that directory; no registration needed. Override `toJSON()` to strip sensitive columns.

### Error handling

Use `throwHttpError(message, name, statusCode)` from `@/utils/error`. The error middleware chain at the end of `app.ts` handles 404, logging (`handleReportError`), and JSON rendering (`handleRenderError`).

### Validators (`src/utils/validators.ts`)

- `validateText(fields)` / `validateNumeric(fields)` / `validateArray(fields)` — express-validator wrappers
- `validateAuth` — checks `res.locals.user` exists
- `validateRoles(roles)` — checks user role

## 3. Code Conventions

### Imports

- **Alias**: `@/` maps to `src/`.
- **Order**: `@/` imports first, then external libraries (oxfmt enforces this).
- Remove unused imports.

### Naming

- **Files**: PascalCase for models/classes (`User.ts`), camelCase for everything else (`auth.ts`, `validators.ts`).
- **Variables/Functions**: camelCase.
- **Interfaces/Types**: PascalCase. No `I` prefix (`UserProps`, not `IUser`).

### TypeScript

- Strict mode enabled. Define types explicitly — avoid `any`, prefer `unknown`.

## 4. Adding a New Resource

Follow thin-route / service / model separation:

1. **Model** — add `.ts` to `src/database/mysql/models/`. Auto-loaded; no registration. Override `toJSON()` for sensitive fields.
2. **Service** — add `src/services/<resource>.ts`. All DB and business logic here.
3. **Route** — add `src/routes/<area>/<resource>.ts`, mount in parent `index.ts`. Use validators for input, `throwHttpError` for errors, `getPaging` for paginated lists.

```ts
// Route example
router.get('/', validateRoles(['admin']), async (req, res) => {
  const { page, pageSize, offset, limit } = getPaging(req.query);
  const total = await countItems({});
  const items = await getItems({ offset, limit });
  res.json({ items, paging: { page, pageSize, total } });
});
```

```ts
// Service example
import { User } from '@/database/mysql/models/User';
import { throwHttpError } from '@/utils/error';

export const findUserByEmail = async (email: string) => {
  const user = await User.findOne({ where: { email } });
  if (!user) throwHttpError('User not found', 'EntityNotFound', 404);
  return user;
};
```

### `res.locals.user` typing

`src/@types/express/index.d.ts` augments `Express.Locals` so `res.locals.user` is typed as `AuthUser | null`. Extend this file when adding new locals.

## 5. Verification Checklist

1. `npm run lint` — no ESLint errors
2. `npm test` — no regressions
3. `npm run format:check` — formatting passes
