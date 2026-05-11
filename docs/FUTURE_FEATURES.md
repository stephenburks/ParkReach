# ParkReach — Future Features

Intentionally deferred. Don't implement these during v1. Pick them up in a second pass once the app is live and stable.

---

## Phase 2 — Polish & Improvements

Things that would make the existing product better but aren't blocking launch.

### Accessibility Audit

Run a formal axe-core scan and manual keyboard walkthrough. Resolve any critical/serious WCAG 2.1 AA violations. Document findings in project docs.

### Content Security Policy

Add a proper CSP header to `next.config.ts`. Must use Next.js nonces (see the [Next.js CSP guide](https://nextjs.org/docs/app/guides/content-security-policy)) — a static string CSP blocks Next.js's own JS chunks. Domains to allow: `maps.googleapis.com`, `maps.gstatic.com`, `*.supabase.co`, `developer.nps.gov`, `api.weather.gov`.

### Map Marker Clustering

Add `@googlemaps/markerclusterer` to group pins at low zoom levels. Currently ~470 individual markers render fine at the default zoom, but clustering would improve the experience when zoomed out. Revisit after user testing.

### Test Coverage

Only one test file exists (`ParkCard.test.tsx`). Add unit tests for hooks and utilities, integration tests for API routes, and at least one Playwright e2e test for the core save flow.

### OG Image Generation

Dynamic Open Graph images for park detail pages using Next.js `ImageResponse`. Park hero image + name + designation on a branded template.

**Where:** `src/app/parks/[parkCode]/opengraph-image.tsx`

### `loading.tsx` Skeletons

Add route-level loading skeletons for park detail and profile pages. Currently missing — the pages just show nothing while data loads.

---

## Phase 3 — New Features

Meaningful additions that require new infrastructure or design work.

### Trip Planning

Group wishlisted parks into named trips with notes and target dates.

**Requires:** New `trips` and `trip_parks` tables in Supabase, trip creation UI, trip detail page.

### Default View Preference

Let users set their preferred view (cards / minimal / map) in their profile. The `default_view` column already exists in the `profiles` table — it just isn't wired to the `?view=` URL param yet.

### User Display Name & Avatar

The `profiles` table has `display_name` and `avatar_url` columns populated from Google OAuth on signup. Surface these on the profile page instead of just showing the email address.

---

## Blocked — External Dependencies

These can't be built until an external blocker is resolved.

### Apple Sign In

**Blocked by:** Paid Apple Developer account ($99/year)

When unblocked:

1. Enroll at https://developer.apple.com, create an App ID and Services ID
2. Register `parkreach.app` under the Services ID
3. Add the Services ID + private key to Supabase Auth → Apple provider
4. Add a "Continue with Apple" button to `src/app/auth/login/page.tsx` using `supabase.auth.signInWithOAuth({ provider: 'apple' })`

Note: Apple Sign In requires HTTPS + real domain. Won't work on localhost without a tunnel.

### Passkeys (WebAuthn)

**Blocked by:** Supabase WebAuthn reaching GA

Monitor https://github.com/supabase/supabase/issues. No schema changes needed when it lands — Supabase manages credentials internally. Add a "Use a passkey" button to the login page.

---

## Intentionally Not Building

### Admin-Curated Park of the Day

The deterministic algorithm works fine. An admin UI to hand-pick the daily park only makes sense with a regular user base. Revisit if the project grows.
