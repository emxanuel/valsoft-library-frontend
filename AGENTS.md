# Agent / contributor guide

This document helps humans and coding agents work on the **valsoft-library-frontend** project. Update it when you add features, change conventions, or alter how the app is run.

## Stack

- **React** 19 + **Vite** 8
- **TypeScript** (strict)
- **TanStack Query** for server state (caching, mutations, invalidation)
- **Axios** for HTTP (`withCredentials: true` for session cookies)
- **Zustand** for client auth session mirror (current user + coarse status)
- **Zod** for form validation aligned with API shapes
- **React Router** 7
- **Tailwind CSS** 4 + **shadcn**-style UI under `src/features/shared/components/ui/`

## Project layout

| Area | Role |
|------|------|
| [`src/features/shared/services/client.ts`](src/features/shared/services/client.ts) | Shared Axios instance (`api`): `baseURL` from `VITE_API_BASE_URL`, credentials included |
| [`src/features/<feature>/services/types.ts`](src/features/auth/services/types.ts) | API DTO types (mirror backend Pydantic / OpenAPI) |
| [`src/features/<feature>/services/requests.ts`](src/features/auth/services/requests.ts) | Thin request functions calling `api` (no React) |
| [`src/features/<feature>/schemas.ts`](src/features/auth/schemas.ts) | Zod schemas for forms |
| [`src/features/<feature>/components/`](src/features/auth/components/) | Feature UI composition |
| [`src/features/<feature>/hooks/`](src/features/auth/hooks/) | TanStack Query hooks, feature helpers |
| [`src/features/<feature>/stores/`](src/features/auth/stores/auth-store.ts) | Zustand stores when needed |
| [`src/features/<feature>/pages/`](src/features/auth/pages/) | Route-level screens |
| [`src/router/`](src/router/index.tsx) | `BrowserRouter`, public vs protected routes |
| [`src/features/shared/components/ui/`](src/features/shared/components/ui/) | shadcn primitives (Button, Input, Card, Dialog, …) |

### UI conventions

- Prefer **shadcn components** from `features/shared/components/ui/` for interactive controls and layout primitives.
- Add new primitives with the [shadcn CLI](https://ui.shadcn.com/) (`pnpm dlx shadcn@latest add …`) so styling stays consistent with `components.json` and `src/index.css`.

## Backend API

The UI targets the FastAPI app in **valsoft-library-backend**:

- **Auth** (cookie `session_id`): `POST /auth/register`, `POST /auth/login`, `GET /auth/me`, `POST /auth/logout`
- **Library** (requires login): `GET/POST /library/books`, `GET/PATCH/DELETE /library/books/{id}`, `POST .../checkout`, `POST .../checkin`

See the backend [`AGENTS.md`](../valsoft-library-backend/AGENTS.md) for behavior (soft delete, loans, etc.).

## Local development

1. Run the API (default `http://127.0.0.1:8000`).

2. Copy [`.env.example`](.env.example) to `.env` and leave `VITE_API_BASE_URL` empty so the Vite dev server can proxy API calls on the **same origin** (needed for session cookies in the browser).

3. Start the frontend:

   ```bash
   pnpm install
   pnpm dev
   ```

   Default dev URL: `http://localhost:3010` (see [`vite.config.ts`](vite.config.ts)).

4. **Proxy**: [`vite.config.ts`](vite.config.ts) proxies `/auth` and `/library` to `VITE_PROXY_TARGET` or `http://127.0.0.1:8000`. Override with env if your API runs elsewhere.

### Session cookies on HTTP

The API may set `session_id` with `secure=True`. Browsers will **not** send that cookie over plain `http://localhost`. If login never persists, run the API over HTTPS in dev or relax `secure` in the backend for development only.

## Build & quality

```bash
pnpm build    # tsc + vite build
pnpm lint     # eslint
```

## State management

- **TanStack Query**: books list/detail, auth `GET /auth/me`, and all mutations (login, register, logout, book CRUD, checkout/checkin). Use query keys from [`auth/query-keys.ts`](src/features/auth/query-keys.ts) and [`library/query-keys.ts`](src/features/library/query-keys.ts).
- **Zustand** ([`auth-store.ts`](src/features/auth/stores/auth-store.ts)): mirrors the logged-in user and status for layouts and menus; cleared on logout.

## When you change something

- New API fields: update the relevant `services/types.ts` and `requests.ts`, then forms/schemas and UI.
- New routes: add pages under `features/*/pages/`, wire in [`src/router/index.tsx`](src/router/index.tsx), and extend this file if behavior is non-obvious.
- New shared UI: add under `features/shared/components/ui/` (shadcn) or `features/shared/components/` for one-off layout.
