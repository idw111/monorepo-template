# Agent Guide for api

This repository is a TypeScript Express server template using Sequelize for MySQL.
Follow these guidelines strictly when writing code.

## 1. Environment & Commands

### Build & Run

- **Build**: `npm run build` (Uses SWC for fast compilation)
- **Dev Server**: `npm run dev` (Uses node --watch)
- **Start**: `npm start`
- **Docker**:
  - Start DB: `npm run docker:start`
  - Stop DB: `npm run docker:stop`

### Linting & Formatting

- **Lint**: `npm run eslint`
- **Format**: `npm run format` (Prettier)
- **Rule**: Always run lint and format before committing changes.

### Testing

- **Framework**: Mocha + Should + Supertest (implied)
- **Run All Tests**: `npm test`
- **Run Single Test**: `npx mocha "src/path/to/test.ts"`
- **Run with Grep**: `npx mocha "src/**/*.test.ts" --grep "pattern"`
- **Environment**: Tests load `.env` via `dotenv/config`.

## 2. Project Structure

```
src/
├── configs/        # Environment variables and app setup
├── database/       # Database connection and models
│   ├── mysql/      # MySQL specific code
│   │   └── models/ # Sequelize models (One file per model)
├── routes/         # Express routes (Controller layer)
├── services/       # Business logic (Service layer)
├── utils/          # Shared utilities (validators, errors, etc.)
├── index.ts        # Entry point
```

## 3. Code Style & Conventions

### Imports

- **Alias**: Use `@/` to refer to `src/`.
  - ✅ `import { User } from '@/database/mysql/models/User';`
  - ❌ `import { User } from '../../database/mysql/models/User';`
- **Order**: External libraries first, then internal modules.
- **Unused**: Remove unused imports (Prettier plugin handles this).

### Naming

- **Files**:
  - Models/Classes: PascalCase (e.g., `User.ts`, `HttpError.ts`)
  - Services/Routes/Utils: camelCase (e.g., `auth.ts`, `validators.ts`)
- **Variables/Functions**: camelCase.
- **Interfaces/Types**: PascalCase. Do NOT use `I` prefix (e.g., `UserProps`, not `IUser`).

### TypeScript

- **Strictness**: `noImplicitAny` is likely enabled. Define types explicitly.
- **DTOs**: Use interfaces for data transfer objects.
- **Avoid Any**: Use `unknown` if type is truly ambiguous, but prefer strict typing.

## 4. Domain Specific Rules

### Configuration (`src/configs/`)

- **Env Vars**: Access strictly via `src/configs/envvars.ts`.
- **Add New Var**:
  1. Add to `.env`
  2. Add to `envvars.ts` export.

### Database (`src/database/`)

- **ORM**: Sequelize-Typescript.
- **Models**:
  - Located in `src/database/mysql/models/`.
  - Extend `Model`.
  - Use decorators: `@Table`, `@Column`.
  - **Sensitive Data**: Override `toJSON()` to exclude private fields (e.g., password).
- **Relationships**:
  - Always use `{ constraints: false }` for `BelongsTo`, `HasMany`, etc., to allow soft logic constraints if needed.

### Routes (`src/routes/`)

- **Express 5**: Native async support is enabled.
  - ✅ `router.get('/', async (req, res) => { ... })`
  - ❌ Do NOT use `asyncRouter` wrappers unless specifically required by middleware.
- **Response**:
  - JSON Data: `res.json({ data })`
  - Success (No content): `res.send('OK')`
  - Errors: Throw errors to be caught by global handler.
- **Logic**: Routes should be thin. Delegate logic to `src/services/`.
- **Validation**: Use `src/utils/validators.ts` middleware (e.g., `validateText`).

### Services (`src/services/`)

- **Scope**: All DB interactions and business logic.
- **Naming**: File name should be plural lowercase of the domain (e.g., `users.ts`).
- **Return**: Return plain objects or model instances. Avoid returning HTTP responses directly.

### Error Handling

- **Class**: Use `HttpError` from `@/utils/error`.
- **Throwing**:
  - ✅ `throwHttpError('Invalid password', 'AuthError', 401);`
  - ❌ `throw new Error('Invalid password');` (Unless it's a system error)
- **Global Handler**: Errors are caught by `handleRenderError` in `src/utils/error.ts`.

## 5. Implementation Workflow (Agent Instructions)

When implementing a feature:

1.  **Define Model**: If DB changes are needed, update/create model in `src/database/mysql/models/`.
2.  **Service**: Implement logic in `src/services/`. Use `sequelize` methods.
3.  **Route**: Create/Update route in `src/routes/`.
    - Add input validation.
    - Call service.
    - Return response.
4.  **Register**: Add route to `src/routes/index.ts` or parent router.
5.  **Verify**:
    - Run `npm run eslint` to check for issues.
    - Run `npm test` to ensure no regressions.

## 6. Example Snippets

**Service Function:**

```typescript
import { User } from '@/database/mysql/models/User';
import { throwHttpError } from '@/utils/error';

export const findUserByEmail = async (email: string) => {
  const user = await User.findOne({ where: { email } });
  if (!user) throwHttpError('User not found', 'EntityNotFound', 404);
  return user;
};
```

**Route Handler:**

```typescript
import { Router } from 'express';
import { validateText } from '@/utils/validators';
import { findUserByEmail } from '@/services/users';

const router = Router();

router.get('/:email', validateText(['email'], 'params'), async (req, res) => {
  const user = await findUserByEmail(req.params.email);
  res.json({ user });
});
```
