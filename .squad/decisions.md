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

### 8. Map library — `@vis.gl/react-google-maps` + `@googlemaps/markerclusterer`

Google Maps integration uses `@vis.gl/react-google-maps`. `ParkMap` is lazy-loaded via `next/dynamic` with `ssr: false`. Clustering is implemented via `@googlemaps/markerclusterer` using a `ClusteredPins` inner component that calls `useMap()` to access the Google Maps instance — this pattern is required because `useMap()` only works inside `<APIProvider>`.

---

### 9. WCAG 4.1.2 fixes — form label gaps (Phase 2 audit)

All `<input>` and `<select>` elements in `SearchFilter` and `AuthModal` now have associated `<label>` elements (visually hidden with `sr-only`). Designation filter buttons have `aria-pressed`. The `ParkCard` hover overlay uses `group-focus-within:opacity-100` so save buttons are reachable by keyboard. `text-stone-400` replaced with `text-stone-500` in `AuthModal` light-mode text (contrast ratio 2.52:1 → 4.79:1). The hero title overlay in `ParkModal` has `pointer-events-none` (display-only, was intercepting clicks on save buttons below).

---

### 10. Trip planning schema — `trips` + `trip_parks`, no parks cache

`trips` has `user_id`, `name`, `description`. `trip_parks` has `trip_id` + `park_code` (NPS string) with a unique constraint. No park details are stored — NPS API remains the source of truth. RLS on both tables: owner policy uses `auth.uid() = user_id` on trips, and a correlated subquery on trip_parks.

---

### 11. Default view persistence — RSC prop + fire-and-forget update

`page.tsx` RSC reads `profiles.default_view` server-side (via `createClient()` from `@/lib/supabase/server`) and passes it as `defaultView` prop to `ExplorerClient`. This avoids a flash of the wrong view during client hydration. When the user toggles the view, `ExplorerClient` calls `supabase.from('profiles').update(...)` via the `supabase` instance from `useAuth()` — fire-and-forget, no await, since the URL param update already reflects the change immediately.

---

### 12. `useTrips` loads all trips + trip_parks for the user upfront

The `useTrips` hook fetches all trips first, then all trip_parks in a second query (using `.in('trip_id', [...ids])`). Both queries are lightweight for typical usage. This lets components (AddToTripButton, TripContent) filter locally without additional fetches. If a user has zero trips, the second query is skipped.

---

### 13. `htmlFor`/`id` label association — do not combine with `aria-label` on the same input

For all `<input>` elements with a visible or sr-only `<label>`, use the `htmlFor`/`id` pairing as the sole accessible name mechanism. Do not add a redundant `aria-label` on the same input — `aria-label` takes precedence in the ARIA name computation (Step 2B beats Step 2E) and effectively hides the `<label>` relationship from assistive technology. A standalone `aria-label` is fine when there is no `<label>` element at all (e.g. icon buttons, search inputs without an explicit label). The two patterns must not be combined.

---

### 14. `isValidParkCode` lives in `src/lib/validate-park-code.ts`

NPS park codes are 2–5 lowercase letters (e.g. `yose`, `grca`, `zion`). The shared validation helper at `src/lib/validate-park-code.ts` exports `isValidParkCode(parkCode: string): boolean` using `/^[a-z]{2,5}$/`. All API routes that receive a `parkCode` path parameter must import from this module — do not define inline regex validators in route files.

---

## Governance

- All meaningful architectural changes require a decision note here.
- Decisions describe direction. Implementation details live in the code.
- Inbox files in `.squad/decisions/inbox/` are merged here by Scrappy after each session.
