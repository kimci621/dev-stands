# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Development server (http://localhost:3000)
npm run build        # Production build
npm run preview      # Preview production build
npm run generate     # Static generation
```

No test runner is configured.

## Architecture

**Nuxt 3 SPA** (SSR disabled) for managing development stands (test environments). Uses Supabase (PostgreSQL) as the database.

### Data Flow

```
pages/ → composables/ → server/api/ → Supabase
```

- **`pages/`** — Vue route pages; `index.vue` is the main dashboard
- **`composables/`** — All business logic lives here; auto-imported across the app
- **`server/api/`** — Nuxt server routes that proxy to Supabase
- **`components/`** — UI components (StandCard, StandGroup, etc.)

### Key Composables

| File | Purpose |
|------|---------|
| `useSupabase.js` | Supabase client + raw DB operations; contains default stand definitions |
| `useStands.js` | Stand state management, polling (10–30s interval), occupy/release logic |
| `useApi.js` | HTTP wrapper calling `/server/api/stands/*` routes |
| `useUser.js` | Auth state persisted to localStorage |

### Stand Data Model

Stands have: `id`, `name`, `type` (frontend/backend), `status` (free/occupied), `occupied_by`, `task_url`, `ended_at`, `comment`.

### API Routes (`server/api/stands/`)

- `GET /` — fetch all stands
- `POST /` — actions: `occupy`, `release`, `task`, `comment`, `end-time`
- `POST /reset` — reset all stands to free
- `POST /reset-expired` — auto-release stands past their `ended_at`
- `POST /recreate` — recreate default stands from `useSupabase.js` defaults

### Supabase Config

Credentials are in `nuxt.config.ts` under `runtimeConfig.public`. The anon key is intentionally public (Supabase row-level security handles access control).

### UI

PrimeVue 4 (Aura theme) + Tailwind CSS. Custom Tailwind colors: `stand-free` (green), `stand-occupied` (red), `primary` (blue).
