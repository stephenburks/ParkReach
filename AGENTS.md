# ParkReach — Agent Guidelines

## ⚠️ This is Next.js 16, not your training data

APIs, file structure, and conventions differ from earlier versions. Read the relevant guide in `node_modules/next/dist/docs/` before writing code. Heed deprecation notices.

## Project Docs

- `docs/SPEC.md` — full product spec, schema, file list, implementation phases
- `docs/SETUP.md` — external services setup (Supabase, Google Cloud, domain)
- `docs/FUTURE_FEATURES.md` — deferred features (Apple Sign In, passkeys, OG images)
- `docs/PROGRESS.md` — current phase, what's done, where we left off

## Key Rules

- **Read `docs/SPEC.md` before starting any phase.** Understand which phase you are implementing and what it depends on.
- **Do not implement features from `docs/FUTURE_FEATURES.md`.** Add a TODO comment at the relevant location instead.
- **Never hardcode secrets.** All API keys and credentials go through `varlock` + `pass`. See `.env.schema` for the current list.
- **Placeholder domain is `parkreach.app`.** Use it in canonical URLs, OG tags, and redirect URIs until the real domain is set.
- **Accessibility is not optional.** Every interactive element needs keyboard support and a visible focus ring. Follow WCAG 2.1 AA throughout — not just in the audit phase.
- **ShadCN + Tailwind.** Use ShadCN components for UI elements. Use Tailwind utilities for layout and one-offs. Do not reach for custom CSS unless Tailwind genuinely cannot cover it.
- **Server Components by default.** Only add `'use client'` when the component needs browser APIs, event handlers, or React state. Keep data fetching in RSCs.
- **URL-driven state.** View mode (`?view=`), filters, and search query live in URL params via `nuqs` so they are shareable and bookmarkable.
- **Commit messages** — conventional format (`type(scope): message`), concise, no co-author or tool attribution lines.

## Architecture Gotchas

### Middleware lives in `src/proxy.ts`, not `middleware.ts`

There is no root `middleware.ts`. Next.js 16 reads `src/proxy.ts` instead, which exports a `proxy()` function and a `config` matcher. It handles both Supabase session refresh (via `src/lib/supabase/middleware.ts`) and nonce-based CSP header injection. Do not create a root `middleware.ts` — it will conflict.

### Varlock replaces direct env access

`next.config.ts` wraps the config with `varlockNextConfigPlugin()`. The `@next/env` package is overridden to `@varlock/nextjs-integration` (see `package.json` overrides). Secrets are fetched via `pass()` at build/dev time — never put real values in `.env*` files. The schema in `.env.schema` defines which keys exist and their `pass()` paths.

### Tailwind v4 — no config file

Tailwind v4 uses CSS-based configuration. There is no `tailwind.config.ts`. All customization lives in `src/app/globals.css` via `@theme inline { }`. PostCSS uses `@tailwindcss/postcss`. Do not generate a `tailwind.config.*` file.

### ShadCN style is `base-nova`

`components.json` sets `"style": "base-nova"`. When adding ShadCN components, use `npx shadcn@latest add <component>` — it respects the config. Components land in `src/components/ui/`.

### Supabase client pattern

- **Browser** (`src/lib/supabase/client.ts`): `createClient()` returns a singleton. Sync call.
- **Server** (`src/lib/supabase/server.ts`): `createClient()` is `async` (calls `cookies()`). Always `await` it.
- **Auth in middleware**: Uses `supabase.auth.getUser()` — not `getSession()`, which skips JWT validation.

### Provider hierarchy (root layout)

`NuqsAdapter > QueryProvider > AuthProvider > DarkModeProvider > SavesProvider`

Adding a new context provider? Nest it at the right level — auth-dependent providers go inside `AuthProvider`, theme-aware ones inside `DarkModeProvider`.

### Route structure

- `src/app/` — pages: `/`, `/parks/[parkCode]`, `/auth/login`, `/auth/verify`, `/auth/error`, `/profile`, `/trips/[tripId]`
- `src/app/api/` — API routes: `amenities/`, `auth/`, `distance/`, `parks/`, `weather/`
- `supabase/migrations/` — DB migrations (001_initial, 003_trips)

## Commands

```bash
npm run dev          # Next.js dev server
npm run build        # Production build
npm run lint         # ESLint (flat config, eslint.config.mjs)
npm run typecheck    # tsc --noEmit (strict mode)
npm run test         # Vitest in watch mode
npm run test:run     # Vitest single run
npm run test:coverage # Vitest with coverage
```

**Verification order:** `lint → typecheck → test:run`

### E2E tests

Playwright, config in `playwright.config.ts`. Tests live in `tests/e2e/`.

```bash
npx playwright test            # Run e2e suite
```

Reuses a running dev server locally (`http://localhost:3000`); starts fresh in CI. Only Chromium project configured.

### Unit tests

Vitest with jsdom. Test files: `src/**/*.test.{ts,tsx}`. Setup: `src/test/setup.ts` (imports `@testing-library/jest-dom/vitest`). Path alias `@/` → `./src/` configured in `vitest.config.ts`.

## Team (Mystery Inc. edition)

ParkReach's agents are Scooby-Doo themed. Invoke with `@agent_name` in OpenCode.

| Agent | Role | Domain | Color |
|-------|------|--------|-------|
| **Fred** | Lead Architect | System design, ADRs, issue triage, cross-cutting decisions | Amber |
| **Daphne** | Frontend Developer | `src/app/`, `src/components/`, UI, client state, WCAG compliance | Pink |
| **Velma** | Backend Developer | `src/app/api/`, Route Handlers, DB schema, integrations, env/config | Purple |
| **Shaggy** | Test Engineer & ADA/WCAG Specialist | All test authoring, a11y audits, quality gates | Green |
| **Scooby** | Code Reviewer | PR review gate, code quality, cross-agent review coordination | Indigo |

**Routing rules:**
- UI change → `@daphne` + `@shaggy` (a11y is a gate, not a suggestion)
- API/backend → `@velma` + `@shaggy` (test coverage)
- Architecture decision → `@fred` (design note before implementation)
- Pre-merge review → `@scooby` (correctness → clarity → style)

## Code Style

- Tabs for indentation
- Single quotes in JS/TS
- `const` by default, `let` only when reassignment is needed
- `async/await` over Promise chains
- Early returns over nested conditionals
- Path alias: `@/*` → `./src/*`

## Node version

`.nvmrc` specifies `v22.22.2`
