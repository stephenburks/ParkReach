# Squad Decisions

## Active Decisions

### 1. Next.js 16 file convention — `proxy.ts` replaces `middleware.ts`

`middleware.ts` is deprecated in Next.js 16. The session refresh file lives at `src/proxy.ts`, exporting a function named `proxy` (not `middleware`). The helper module at `src/lib/supabase/middleware.ts` is a regular module — it keeps its name. Do not create `middleware.ts` at the project root or in `src/`.

---

### 2. Supabase module boundary

Only `src/lib/supabase/` instantiates Supabase clients. Nothing else imports from `@supabase/supabase-js` or `@supabase/ssr` directly. All Supabase types are re-exported from `src/lib/supabase/` so consumers never need to import from the packages directly. Use `getUser()` in `proxy.ts` — not `getSession()`, which does not revalidate the JWT.

---

### 3. No `parks` table — NPS API is the source of truth

Parks are never cached in Supabase. Only `park_saves` rows (user + parkCode string) are persisted. Syncing a parks table creates a maintenance problem for no benefit — the NPS API already revalidates at 1h.

---

### 4. RSC shell + client island pattern for `page.tsx`

`src/app/page.tsx` is a Server Component that renders the header, `<ParkOfTheDay />` hero (RSC, cached 24h), and `<ExplorerClient />`. `ExplorerClient` is the client island that owns all interactive state (filters, pagination, view toggle, modals). This is required because RSCs cannot be imported into client components.

---

### 5. URL-driven state via `nuqs`

All filter and view state lives in URL params: `?q=`, `?state=`, `?desig=`, `?acc=`, `?view=`. Managed with `nuqs` `useQueryState` hooks in `ExplorerClient`. Benefits over manual `useSearchParams`: built-in debouncing, shallow routing (no scroll jump), SSR-compatible, TypeScript-first.

---

### 6. Accessibility filter is client-side only

The NPS `/parks` endpoint does not support filtering by accessibility keyword. The `?acc=` filter is applied client-side in `ExplorerClient` on the already-fetched park list. The UI notes this limitation. This is a NPS API constraint, not a product decision.

---

### 7. NPS amenities API for accessibility data

The `/parks` endpoint does not include accessibility amenity detail. The park detail page fetches from `/amenities/parksplaces?parkCode={code}` server-side with 1h revalidation. This is the same pattern as the main park fetch — server-side, cached, no extra client request.

---

### 8. Map library — `@vis.gl/react-google-maps`

Google Maps integration uses `@vis.gl/react-google-maps` (not Leaflet, not `@react-google-maps/api`). `ParkMap` is lazy-loaded via `next/dynamic` with `ssr: false` so the Maps JS bundle only loads when the user switches to map view. Clustering is deferred — ~470 markers at zoom 4 are manageable without it.

---

## Governance

- All meaningful architectural changes require a decision note here.
- Decisions describe direction. Implementation details live in the code.
- Inbox files in `.squad/decisions/inbox/` are merged here by Scrappy after each session.
