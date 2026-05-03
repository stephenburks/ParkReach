# ParkReach — Progress

Last updated: 2026-05-03 (Phase 2 started)

The core product is built. All major features exist in code.

---

## Done

**Infrastructure**

- Supabase client/server helpers, all env keys via `pass()`
- ShadCN + Tailwind v4, nuqs, React Query, Google Maps library
- `robots.ts`, `sitemap.ts` (dynamic park routes included)
- DB migration: `profiles` + `park_saves` tables, RLS, auto-create trigger
- `src/proxy.ts` + `src/lib/supabase/middleware.ts` — session refresh on every request
- `next.config.ts` — Google Maps image domains, security headers

**Auth**

- Google OAuth + magic link (email OTP) sign-in, auth callback route, AuthContext
- Login / verify / error pages (standalone login matches AuthModal), AuthModal, AuthButton

**Explorer**

- Cards / Minimal / Map views with URL-driven state (`nuqs`)
- Load More pagination on cards and minimal views
- Search, state, designation, and accessibility filters
- ParkCard (keyboard accessible, save buttons), ParkCardMinimal, ParkMap
- Park of the Day hero (RSC, deterministic by date, cached 24h)
- Skip link, "Skip map" bypass, `aria-live` results count, focus trap in modal

**Park Detail**

- Full detail page with `generateMetadata`, OG tags, canonical URL, JSON-LD structured data
- Live weather widget (NWS API) and driving distance badge (Google Distance Matrix)
- Accessibility info (NPS amenities API), entrance fees, hours, activities
- WishlistButton, VisitedButton (persisted to Supabase)

**Home Page**

- `generateMetadata` with OG tags and canonical URL

**Profile**

- Wishlist and visited sections with park name resolution
- Dark mode persisted to Supabase for auth'd users, localStorage for anon
- `generateMetadata` with noindex (profile split into server wrapper + `ProfileContent` client component)
- `loading.tsx` route-level skeleton

**Park Detail**

- `loading.tsx` route-level skeleton

**Accessibility baseline**

- `prefers-reduced-motion`, `forced-colors` in CSS
- Focus rings, `aria-label` on icon buttons, `role="list"` on grids
- DarkModeToggle icon correct (Sun when dark, Moon when light)

---

---

## Phase 2 — Polish & Pre-Launch

| #   | What                          | Status      | Notes                                              |
| --- | ----------------------------- | ----------- | -------------------------------------------------- |
| 1   | Decisions inbox merged        | ✅ Done      | 8 decisions now in `.squad/decisions.md`           |
| 2   | `generateMetadata` on profile | ✅ Done      | Server wrapper + noindex                           |
| 3   | `loading.tsx` skeletons       | ✅ Done      | Park detail + profile                              |
| 4   | Content Security Policy       | ✅ Done        | Nonce-based CSP in `proxy.ts`; `x-nonce` forwarded to RSC |
| 5   | Test coverage                 | ✅ Done        | 30 vitest tests + 6 Playwright e2e tests (save flow, search, modal) |
| 6   | Accessibility audit           | ✅ Done        | 7 violations fixed; axe tests added; findings in decisions inbox |
| 7   | OG image generation           | ✅ Done        | `opengraph-image.tsx` — edge runtime, branded template |
| 8   | Map marker clustering         | ✅ Done        | `@googlemaps/markerclusterer` via `ClusteredPins` inner component |

---

See `docs/FUTURE_FEATURES.md` for Phase 3 features and blocked items.
