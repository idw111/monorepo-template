# Agent Guide — www

> Next.js 16 + React 19 + Tailwind CSS 4 frontend.

## 1. Project Structure

```
www/
├── app/                # Next.js App Router (pages, layout, globals.css)
├── components/
│   └── pages/          # Feature page components (one per route)
├── contexts/           # React context providers
│   └── app-context.tsx # Global app state (session, server status)
├── lib/
│   ├── api/            # API client and typed fetch functions
│   │   ├── client.ts   # Shared axios instance (withCredentials)
│   │   ├── auth.ts     # fetchCurrentUser()
│   │   └── status.ts   # fetchServerStatus()
│   └── envvars.ts      # envvars.api(path)
└── tsconfig.json       # Path alias: @/ → project root
```

## 2. Architecture

### App Router

Next.js 16 App Router. Pages live under `app/`. Each `page.tsx` is a thin wrapper that imports and renders a feature component from `components/pages/`.

### Global state (`contexts/app-context.tsx`)

`AppProvider` wraps the entire app in `layout.tsx`. On mount it calls `GET /status` and `GET /auth` in parallel via `refreshBootData()`.

Exposed via `useAppContext()`:

- `session.user` — current user or `null`
- `serverStatus` — backend health state
- `setSessionUser(user)` — update after login/logout
- `refreshBootData()` — re-check server + session

If `NEXT_PUBLIC_API_URL` is unset, `AppProvider` short-circuits with an error state.

### API client (`lib/api/client.ts`)

Axios instance with `withCredentials: true` pointed at `envvars.api()`. All API calls go through this client.

### Env (`lib/envvars.ts`)

- `envvars.api(path)` — returns the full API URL with the given path appended (e.g., `envvars.api('/users')` → `http://localhost:5001/users`).

### Fonts & styling

- **Fonts**: IBM Plex Sans KR (`--font-body`) + Space Grotesk (`--font-display`), loaded via `next/font/google` in `layout.tsx`.
- **Styling**: Tailwind CSS 4 with custom theme tokens defined in `app/globals.css` (`--color-canvas`, `--color-ink`, `--color-accent`, etc.).

## 3. Code Conventions

### Imports

- **Alias**: `@/` maps to project root (e.g., `@/components/pages/HomePage`).
- **Order**: `@/` imports first, then external libraries (oxfmt enforces this).

### Naming

- **Files**: kebab-case for directories, PascalCase for component files (`HomePage.tsx`).
- **Components**: Named exports only. Default export only for Next.js `page.tsx` files.
- **Types**: PascalCase. No `I` prefix.

### Component pattern

- `'use client'` at the top if the component uses hooks or browser APIs.
- Keep `app/*/page.tsx` thin — it only imports and renders the feature component.

## 4. Adding a New Page

1. **Page file** — create `app/<route>/page.tsx` as a thin wrapper:

```tsx
import { SomePage } from '@/components/pages/SomePage';
export default function Page() {
  return <SomePage />;
}
```

2. **Feature component** — create `components/pages/SomePage.tsx` with `'use client'` if needed. Put all UI logic here.

## 5. Adding a New API Call

Add a typed async function to `lib/api/<domain>.ts` using the shared client:

```ts
// lib/api/posts.ts
import { apiClient } from '@/lib/api/client';

export type Post = { id: number; title: string };

export async function fetchPosts() {
  const res = await apiClient.get<{ posts: Post[] }>('/posts');
  return res.data.posts;
}
```

## 6. Verification Checklist

1. `npm run lint` — no ESLint errors
2. `npm run build` — production build passes
3. `npm run format:check` — formatting passes
