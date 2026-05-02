# ParkReach — Product Spec

An accessibility-first national parks explorer. Users can discover, filter, save,
and plan visits to US national parks with live weather, distance info, and
map/card/minimal views. Built on Next.js 16 / TypeScript / Tailwind CSS / ShadCN.

See `docs/SETUP.md` for external services setup.
See `docs/FUTURE_FEATURES.md` for deferred features (Apple Sign In, passkeys, etc.).

---

## Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js 16 (App Router) | Already in use |
| Language | TypeScript (strict) | Already in use |
| Styling | Tailwind CSS v4 + ShadCN | ShadCN sits on top of Tailwind — both are needed |
| Database + Auth | Supabase | Free tier, see `docs/SETUP.md` |
| Parks data | NPS API | Already wired via `/api/parks` |
| Weather | National Weather Service API | Free, no key, US-only — perfect fit |
| Maps | Google Maps JS API + Distance Matrix | Single billing account, $200/month free credit |
| Secrets | varlock + pass (GPG) | Already configured |

---

## Database Schema

### `profiles`
One row per user. Auto-created by a Supabase trigger on `auth.users` insert.

| Column | Type | Default |
|---|---|---|
| `id` | `uuid` | FK → `auth.users(id)` on delete cascade |
| `display_name` | `text` | null |
| `avatar_url` | `text` | null |
| `dark_mode` | `boolean` | `false` |
| `default_view` | `text` | `'cards'` |
| `created_at` | `timestamptz` | `now()` |

### `park_saves`
Unified wishlist + visited. One row per (user, park).

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | `gen_random_uuid()` |
| `user_id` | `uuid` | FK → `profiles(id)` on delete cascade |
| `park_code` | `text` | NPS `parkCode` string |
| `wishlisted` | `boolean` | `false` |
| `visited` | `boolean` | `false` |
| `created_at` | `timestamptz` | `now()` |

Unique constraint: `(user_id, park_code)`. Row-Level Security: users read/write own rows only.

No `parks` table — parks live in the NPS API. Caching them creates a sync problem for no benefit.

---

## Auth

Three sign-in methods, same user across all three:

- **Magic link** — email-only, no password
- **Google OAuth**
- **Apple OAuth** — deferred, see `docs/FUTURE_FEATURES.md`

Account linking: Supabase "link by email" setting enabled. Same email address across
any sign-in method resolves to the same `auth.users` row.

Passkeys (WebAuthn): deferred until Supabase GA. Login page has a TODO comment placeholder.

---

## Features

### Landing Page
- **Park of the Day** hero — deterministic by date (`hash(YYYY-MM-DD) % total_parks`),
  server-rendered, cached 24h. Same park for all users each day. No DB writes needed.
- Search + filter bar (synced to URL params)
- View toggle: Cards / Minimal / Map (synced to `?view=` URL param)

### Park Explorer
Three views, all driven by `?view=` URL param, defaulting to `cards`:

- **Card view** — extends the existing POC, adds accessibility badge and save buttons
- **Minimal view** — compact single-row per park, no image, dense layout
- **Map view** — Google Maps with park pins, clusters when zoomed out, InfoWindow on click. Lazy-loaded (`dynamic({ ssr: false })`).

### Park Detail Page (`/parks/[parkCode]`)
- Full NPS park info
- Weather widget (NWS API via `/api/weather`)
- Distance from user (Google Distance Matrix via `/api/distance`, after geolocation permission)
- Wishlist + Visited toggles (persisted in Supabase for auth'd users)
- Accessibility info section (from NPS API `accessibility` field)
- Shareable URL with proper OG metadata

### User Account
- Passwordless sign-in (magic link + Google)
- Wishlist and visited history on profile page
- Dark mode preference (persisted across devices for auth'd users, localStorage for anon)
- Default view preference

---

## SEO

Next.js App Router handles SEO natively as server components render full HTML.

| Item | Implementation |
|---|---|
| Page metadata | `generateMetadata()` per route (title, description, OG tags, canonical URL) |
| Park detail OG | Dynamic title/description from NPS park data |
| Sitemap | `src/app/sitemap.ts` — static routes + dynamic park routes from NPS API, `revalidate: 86400` |
| robots.txt | `src/app/robots.ts` — allow all, point to sitemap |
| Structured data | JSON-LD `TouristAttraction` schema on park detail pages for Google rich results |
| Canonical URLs | `<link rel="canonical">` via `alternates.canonical` in `generateMetadata` |
| Placeholder domain | All canonical URLs use `https://parkreach.app` until real domain is set |

---

## Performance

| Concern | Approach |
|---|---|
| Images | `next/image` everywhere — automatic WebP conversion, lazy loading, blur placeholder |
| Fonts | `next/font` if custom fonts are added — eliminates layout shift |
| Map bundle | `dynamic(() => import('./ParkMap'), { ssr: false })` — map JS loads only when map view is active |
| Modal | `dynamic(() => import('./ParkModal'), { ssr: false })` — not needed on initial render |
| NPS API caching | Route handler uses `fetch` with `next: { revalidate: 3600 }` — park data cached 1h |
| Park of the Day | `revalidate: 86400` — fetched once per day server-side |
| Weather | `/api/weather` route uses `revalidate: 3600` — NWS data cached 1h |
| Server Components | All data-fetching components are RSCs — no client-side fetching waterfalls |
| Suspense | `loading.tsx` files for each route, `<Suspense>` wrappers around async components |
| Bundle analysis | `@next/bundle-analyzer` available via `ANALYZE=true npm run build` |

---

## Accessibility

WCAG 2.1 AA as the baseline throughout.

- All interactive elements have visible `:focus-visible` rings
- All images have meaningful `alt` text (decorative images use `alt=""`)
- All icon-only buttons have `aria-label`
- Park grid uses `<ul>/<li>` so screen readers announce the count
- `aria-live="polite"` region for results count (updates when filters change)
- Focus trap in modal (Tab/Shift+Tab cycle within; focus returns to trigger on close)
- Map view has "Skip map, view as list" keyboard bypass link
- `prefers-reduced-motion` disables card hover animations and image transitions
- `@media (forced-colors: active)` overrides for Windows High Contrast mode
- Accessibility filter: "Wheelchair Accessible Only" — client-side filter with a tooltip
  noting it only filters currently-loaded parks (NPS API limitation)

---

## Files to Create

### Config / Infrastructure
- `src/lib/supabase/client.ts` — browser Supabase client singleton
- `src/lib/supabase/server.ts` — per-request server client with cookie adapter
- `src/lib/supabase/middleware.ts` — session refresh logic
- `middleware.ts` (root) — refreshes session on every request
- `src/app/robots.ts` — robots.txt generation
- `src/app/sitemap.ts` — dynamic sitemap
- `supabase/migrations/001_initial.sql` — profiles + park_saves tables + RLS + trigger

### Types
- `src/types/supabase.ts` — generated via `supabase gen types typescript`
- `src/types/weather.ts` — NWS API response shape
- `src/types/maps.ts` — Distance Matrix response shape

### API Routes
- `src/app/api/auth/callback/route.ts` — Supabase OAuth/magic link callback
- `src/app/api/weather/route.ts` — NWS weather proxy (avoids CORS)
- `src/app/api/distance/route.ts` — Google Distance Matrix (server-only key)

### Auth Pages
- `src/app/auth/login/page.tsx`
- `src/app/auth/verify/page.tsx`
- `src/app/auth/error/page.tsx`

### App Pages
- `src/app/parks/[parkCode]/page.tsx` — park detail
- `src/app/parks/[parkCode]/loading.tsx`
- `src/app/profile/page.tsx` — wishlist + visited + preferences
- `src/app/profile/loading.tsx`

### Components (new)
- `src/components/ViewToggle.tsx`
- `src/components/ParkCardMinimal.tsx`
- `src/components/ParkMap.tsx` — lazy-loaded
- `src/components/ParkMapPin.tsx`
- `src/components/ParkOfTheDay.tsx` — RSC
- `src/components/WeatherWidget.tsx`
- `src/components/DistanceBadge.tsx`
- `src/components/WishlistButton.tsx`
- `src/components/VisitedButton.tsx`
- `src/components/AuthButton.tsx`
- `src/components/AccessibilityInfo.tsx`
- `src/components/DarkModeToggle.tsx`

### Context / Hooks
- `src/context/AuthContext.tsx`
- `src/hooks/useParkSaves.ts`
- `src/hooks/useDarkMode.ts`

---

## Files to Modify

| File | Change |
|---|---|
| `src/app/layout.tsx` | Add AuthContext, dark mode class binding, no-flash script, ParkReach metadata |
| `src/app/page.tsx` | Add ParkOfTheDay hero, ViewToggle, conditional view rendering, URL param reading |
| `src/app/globals.css` | Add `.dark` CSS variable overrides, `forced-colors` and `reduced-motion` blocks |
| `src/types/park.ts` | Add `accessibility` field to `Park` interface |
| `src/components/ParkCard.tsx` | Keyboard handler, `role="button"`, accessibility badge, save buttons |
| `src/components/ParkModal.tsx` | Add WeatherWidget, DistanceBadge, save buttons, AccessibilityInfo, focus trap |
| `src/components/SearchFilter.tsx` | Accessibility filter, sync state to URL params |
| `src/app/api/parks/route.ts` | Try removing `rejectUnauthorized: false` — only keep if NPS API breaks without it |
| `next.config.ts` | Add Google Maps domains to image patterns, CSP headers |
| `package.json` | Add Supabase, Google Maps, ShadCN, bundle analyzer |
| `.env.schema` | Add Supabase and Google Maps keys as `pass()` references |

---

## Implementation Phases

### Phase 0 — Setup and Dependencies
- Install ShadCN: `npx shadcn@latest init`
- Install `@supabase/supabase-js`, `@supabase/ssr`
- Install `@vis.gl/react-google-maps`, `@types/google.maps`
- Add `@next/bundle-analyzer` to devDependencies
- Wire Supabase client/server helpers and `middleware.ts`
- Add `robots.ts` and `sitemap.ts` stubs
- Remove `rejectUnauthorized: false` from NPS route, verify it still works
- Rename package to `parkreach` *(already done)*

### Phase 1 — Database and Auth Backend
- Write `supabase/migrations/001_initial.sql`
- Generate TypeScript types
- Create `/api/auth/callback` route
- Configure Supabase providers (magic link, Google — see `docs/SETUP.md`)

### Phase 2 — Auth UI
- Login, verify, error pages
- `AuthContext` and `AuthButton`

### Phase 3 — Dark Mode and Profile
- `useDarkMode`, dark CSS variables, no-flash script
- `DarkModeToggle`
- `useParkSaves`
- Profile page

### Phase 4 — Explorer Views *(parallel with Phase 3)*
- `ViewToggle`, URL param wiring
- `ParkCardMinimal`
- `ParkMap` (lazy-loaded)
- Extend `Park` type with `accessibility`
- Keyboard-accessible `ParkCard`
- Accessibility filter in `SearchFilter`

### Phase 5 — Park Detail and Save Actions
- `/parks/[parkCode]` page with `generateMetadata`
- `/api/weather` and `/api/distance` routes
- `WeatherWidget`, `DistanceBadge`
- `WishlistButton`, `VisitedButton`
- `AccessibilityInfo`
- Modal focus trap fix
- JSON-LD structured data on park detail page
- Populate profile page wishlist/visited sections

### Phase 6 — Park of the Day *(parallel with Phase 5)*
- `ParkOfTheDay` RSC with deterministic algorithm
- Wire into `src/app/page.tsx` as hero section

### Phase 7 — SEO and Sitemap
- `generateMetadata` on all pages
- `sitemap.ts` with dynamic park routes
- `robots.ts`
- Canonical URLs using `parkreach.app` placeholder

### Phase 8 — Accessibility Audit
- Systematic WCAG 2.1 AA pass (see Accessibility section above)
- Run Axe, resolve all critical/serious violations
- Manual keyboard navigation walkthrough
