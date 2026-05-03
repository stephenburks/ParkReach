# ParkReach — Progress

Last updated: 2026-05-03

The core product is built. All major features exist in code. What remains is a small set of wiring gaps and cleanup items before the app is fully functional end-to-end.

---

## Done

**Infrastructure**

- Supabase client/server helpers, all env keys via `pass()`
- ShadCN + Tailwind v4, nuqs, React Query, Google Maps library
- `robots.ts`, `sitemap.ts` (dynamic park routes included)
- DB migration: `profiles` + `park_saves` tables, RLS, auto-create trigger

**Auth**

- Google OAuth sign-in, auth callback route, AuthContext
- Login / verify / error pages, AuthModal, AuthButton

**Explorer**

- Cards / Minimal / Map views with URL-driven state (`nuqs`)
- Search, state, designation, and accessibility filters
- ParkCard (keyboard accessible, save buttons), ParkCardMinimal, ParkMap
- Park of the Day hero (RSC, deterministic by date, cached 24h)
- Skip link, "Skip map" bypass, `aria-live` results count, focus trap in modal

**Park Detail**

- Full detail page with `generateMetadata`, OG tags
- Accessibility info (NPS amenities API), entrance fees, hours, activities
- WishlistButton, VisitedButton (persisted to Supabase)
- WeatherWidget + DistanceBadge components (built, not yet wired in — see backlog)

**Profile**

- Wishlist and visited sections with park name resolution
- Dark mode persisted to Supabase for auth'd users, localStorage for anon

**Accessibility baseline**

- `prefers-reduced-motion`, `forced-colors` in CSS
- Focus rings, `aria-label` on icon buttons, `role="list"` on grids

---

## Backlog — v1 Completion

These are the remaining items to reach a fully working, shippable state. Nothing here is a new feature — all are gaps or wiring issues in what's already built.

### Must Fix

| #   | What                                                         | Where                               | Notes                                                                                                                                                                          |
| --- | ------------------------------------------------------------ | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | Add `src/proxy.ts`                                           | new file                            | Next.js 16 renamed `middleware.ts` → `proxy.ts`. Without it, auth session cookies don't refresh between requests. Auth will appear to work but silently break on token expiry. |
| 2   | Add `src/lib/supabase/middleware.ts`                         | new file                            | Session refresh helper called by `proxy.ts`.                                                                                                                                   |
| 3   | Wire `WeatherWidget` + `DistanceBadge` into park detail page | `src/app/parks/[parkCode]/page.tsx` | Both components exist and work. They just aren't rendered on the page yet.                                                                                                     |
| 4   | Remove debug logs from park detail                           | `src/app/parks/[parkCode]/page.tsx` | `getAmenities()` has ~10 `console.log('[DEBUG]...')` calls that need to go before any real use.                                                                                |
| 5   | Delete `supabase/migrations/002_security_fixes.sql`          | `supabase/migrations/`              | File is self-marked deprecated — all fixes are already in `001_initial.sql`. Keeping it is a maintenance hazard.                                                               |

### Should Do

| #   | What                                         | Where                               | Notes                                                                                                 |
| --- | -------------------------------------------- | ----------------------------------- | ----------------------------------------------------------------------------------------------------- |
| 6   | Magic link sign-in                           | `src/app/auth/login/page.tsx`       | Spec calls for email magic link alongside Google OAuth. Currently only Google is wired.               |
| 7   | `generateMetadata` on home page              | `src/app/page.tsx`                  | Only has static title/description in `layout.tsx`. Needs page-level OG tags and canonical URL.        |
| 8   | Canonical URLs in `generateMetadata`         | park detail + home page             | Add `alternates.canonical: 'https://parkreach.app/...'` to each page's metadata.                      |
| 9   | JSON-LD structured data on park detail       | `src/app/parks/[parkCode]/page.tsx` | `TouristAttraction` schema — one `<script type="application/ld+json">` tag in the RSC.                |
| 10  | Load More for minimal view                   | `src/components/ExplorerClient.tsx` | Cards view has a Load More button; minimal view doesn't. Map view can skip it.                        |
| 11  | `NEXT_PUBLIC_GOOGLE_MAP_ID` in `.env.schema` | `.env.schema`                       | Missing env var. Needed for styled Google Maps. Add as `pass("parkreach/google-map-id")`.             |
| 12  | CSP headers in `next.config.ts`              | `next.config.ts`                    | Add Content-Security-Policy allowing Google Maps domains (`maps.googleapis.com`, `maps.gstatic.com`). |

### Housekeeping

| #   | What                                                       | Notes                                                                                                 |
| --- | ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ---------------------- |
| 13  | Merge `.squad/decisions/inbox/` into `.squad/decisions.md` | Four decision notes are pending merge (Scrappy). All describe decisions that are already implemented. |
| 14  | `generateMetadata` on profile page                         | Minimal — just `title: 'My Profile                                                                    | ParkReach'`+`noindex`. |
| 15  | `loading.tsx` for park detail and profile routes           | Improves perceived performance. Low effort.                                                           |

---

See `docs/FUTURE_FEATURES.md` for everything that's intentionally deferred.
