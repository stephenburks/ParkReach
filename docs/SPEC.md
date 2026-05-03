# ParkReach — Product Spec

An accessibility-first national parks explorer. Users can discover, filter, save, and plan visits to US national parks with live weather, distance info, and map/card/minimal views.

**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 + ShadCN · Supabase · NPS API · NWS API · Google Maps

See `docs/SETUP.md` for external services setup.
See `docs/FUTURE_FEATURES.md` for deferred features.
See `docs/PROGRESS.md` for current build status and backlog.

---

## Stack

| Layer           | Choice                               | Notes                                                                        |
| --------------- | ------------------------------------ | ---------------------------------------------------------------------------- |
| Framework       | Next.js 16 (App Router)              | `proxy.ts` replaces `middleware.ts` in this version                          |
| Language        | TypeScript (strict)                  |                                                                              |
| Styling         | Tailwind CSS v4 + ShadCN             | Config lives in `globals.css` via `@theme` — no `tailwind.config.js`         |
| Database + Auth | Supabase                             | Free tier                                                                    |
| Parks data      | NPS API                              | Server-side only, cached 1h                                                  |
| Weather         | National Weather Service API         | Free, no key, US-only                                                        |
| Maps            | Google Maps JS API + Distance Matrix | `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` (browser) + `GOOGLE_MAPS_API_KEY` (server) |
| Secrets         | varlock + pass (GPG)                 | All keys in `.env.schema` as `pass()` references                             |
| URL state       | nuqs                                 | `?q=`, `?state=`, `?desig=`, `?acc=`, `?view=`, `?park=`                     |

---

## Database Schema

### `profiles`

One row per user. Auto-created by a Supabase trigger on `auth.users` insert.

| Column         | Type          | Default                                 |
| -------------- | ------------- | --------------------------------------- |
| `id`           | `uuid`        | FK → `auth.users(id)` on delete cascade |
| `display_name` | `text`        | null                                    |
| `avatar_url`   | `text`        | null                                    |
| `dark_mode`    | `boolean`     | `false`                                 |
| `default_view` | `text`        | `'cards'`                               |
| `created_at`   | `timestamptz` | `now()`                                 |

### `park_saves`

Unified wishlist + visited. One row per (user, park).

| Column       | Type          | Notes                                 |
| ------------ | ------------- | ------------------------------------- |
| `id`         | `uuid`        | `gen_random_uuid()`                   |
| `user_id`    | `uuid`        | FK → `profiles(id)` on delete cascade |
| `park_code`  | `text`        | NPS `parkCode` string                 |
| `wishlisted` | `boolean`     | `false`                               |
| `visited`    | `boolean`     | `false`                               |
| `created_at` | `timestamptz` | `now()`                               |

Unique constraint: `(user_id, park_code)`. RLS: users read/write own rows only.

No `parks` table — parks live in the NPS API. Caching them creates a sync problem for no benefit.

---

## Auth

- **Google OAuth** — implemented
- **Magic link** — email-only, no password — wired in spec, not yet implemented (see `docs/PROGRESS.md`)
- **Apple OAuth** — deferred, see `docs/FUTURE_FEATURES.md`

Account linking: Supabase "link by email" enabled. Same email across any sign-in method resolves to the same `auth.users` row.

---

## Features

### Landing Page

- **Park of the Day** hero — deterministic by date (`hash(YYYY-MM-DD) % total_parks`), server-rendered RSC, cached 24h
- Search + filter bar synced to URL params
- View toggle: Cards / Minimal / Map

### Park Explorer

Three views driven by `?view=` URL param, defaulting to `cards`:

- **Cards** — image, name, state, description snippet, save buttons
- **Minimal** — single-row per park, no image, dense layout, save buttons
- **Map** — Google Maps with park pins, InfoWindow on click, lazy-loaded

Filters: free-text search, state/territory, designation type, accessibility keyword. All synced to URL params via nuqs.

### Park Detail (`/parks/[parkCode]`)

- Full NPS park data: description, hours, fees, activities, topics, directions
- Accessibility info (NPS amenities API)
- Weather widget (NWS API, server-proxied)
- Distance from user (Google Distance Matrix, server-proxied, requires geolocation permission)
- Wishlist + Visited toggles (Supabase, auth'd users only)
- `generateMetadata` with OG tags

### User Profile (`/profile`)

- Wishlist and visited park lists with links to detail pages
- Dark mode toggle (persisted to Supabase for auth'd users, localStorage for anon)

---

## Key Conventions

**Server Components by default.** Only add `'use client'` when the component needs browser APIs, event handlers, or React state.

**URL-driven state.** Filters, search, view mode, and selected park all live in URL params. Nothing interactive lives in module-level state.

**Supabase module boundary.** Only `src/lib/supabase/` instantiates Supabase clients. Nothing else imports from `@supabase/supabase-js` or `@supabase/ssr` directly.

**No secrets in client code.** `GOOGLE_MAPS_API_KEY` and `NPS_API_KEY` are server-only. Only `NEXT_PUBLIC_*` keys reach the browser.

**Accessibility is not optional.** WCAG 2.1 AA throughout — not just on the accessibility filter. Every interactive element needs keyboard support and a visible focus ring.

**`proxy.ts` not `middleware.ts`.** Next.js 16 renamed the file convention. The session refresh file lives at `src/proxy.ts`, not `src/middleware.ts`.

---

## SEO

| Item            | Implementation                                                                           |
| --------------- | ---------------------------------------------------------------------------------------- |
| Page metadata   | `generateMetadata()` per route — title, description, OG tags, canonical URL              |
| Park detail OG  | Dynamic title/description from NPS park data                                             |
| Sitemap         | `src/app/sitemap.ts` — static routes + all park routes from NPS API, `revalidate: 86400` |
| robots.txt      | `src/app/robots.ts` — allow all, point to sitemap                                        |
| Structured data | JSON-LD `TouristAttraction` on park detail pages (not yet implemented)                   |
| Canonical URLs  | `alternates.canonical` in `generateMetadata` (not yet implemented)                       |
| Domain          | `https://parkreach.app` placeholder throughout                                           |

---

## Accessibility

WCAG 2.1 AA baseline.

- Visible `:focus-visible` rings on all interactive elements
- Meaningful `alt` text on all images
- `aria-label` on all icon-only buttons
- Park grids use `<ul>/<li>` so screen readers announce item count
- `aria-live="polite"` on results count
- Focus trap in modal (Tab/Shift+Tab cycle; focus returns to trigger on close)
- "Skip map, view as list" keyboard bypass link in map view
- `prefers-reduced-motion` disables animations
- `forced-colors` overrides for Windows High Contrast mode
- Accessibility filter in SearchFilter (client-side; NPS API limitation noted in UI)
