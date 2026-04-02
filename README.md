# Valsoft Library — Frontend

React + TypeScript UI for the library app.

## Prerequisites

- Node.js (LTS)
- pnpm (`corepack enable` or `npm i -g pnpm`)

## Run locally

1. Start the API (default `http://127.0.0.1:8000`) — see the backend repo `README.md`.

2. Copy [`.env.example`](.env.example) to `.env`. Leave **`VITE_API_BASE_URL`** empty so Vite proxies `/auth`, `/library`, and `/admin` to the API (session cookies on one origin).

3. Install and dev server:

   ```bash
   pnpm install
   pnpm dev
   ```

   App: **`http://localhost:3011`** (see [`vite.config.ts`](vite.config.ts)); proxy target defaults to `http://127.0.0.1:8000`.

## Production build

Set **`VITE_API_BASE_URL`** to your API’s public URL. For the AI WebSocket stream, set **`VITE_API_BASE_URL_WS`** if needed ([`src/config.ts`](src/config.ts)).

```bash
pnpm build
```

Output in `dist/`. `pnpm lint` runs ESLint.

Design notes: `../valsoft-library-backend/ARCHITECTURE.md`. Contributor details: [AGENTS.md](AGENTS.md).
