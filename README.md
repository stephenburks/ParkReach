# ParkReach

An accessibility-first National Parks explorer. Discover, filter, save, and plan visits to
US national parks with live weather, driving distances, and rich park data — all in a
clean, fast interface designed to be usable by everyone.

**[parkreach.app](https://parkreach.app)**

---

## Features

- **Park Explorer** — card, list, and map views with URL-driven search, state, designation,
  and accessibility filters
- **Park of the Day** — a new featured park every day on the homepage
- **Park Detail Pages** — full NPS data: hours, fees, activities, topics, weather,
  driving distance, directions, campgrounds, events, visitor centers, and news
- **Accessibility First** — WCAG 2.1 AA compliance throughout. Real accessibility
  data from the NPS API: wheelchair access, braille, ASL, audio description, accessible
  restrooms, and service animal relief areas. Keyboard navigation, visible focus rings,
  and screen reader support on every interactive element.
- **Trip Planning** — create trips, add parks, share itineraries
- **Wishlist & Visited** — save parks to your wishlist or mark them as visited
- **Dark Mode** — system-aware or manual toggle, persisted across sessions
- **Live Weather** — current conditions and forecast via the National Weather Service API
- **Driving Distance** — Google Distance Matrix integration with geolocation opt-in

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 + ShadCN (base-nova) |
| Database & Auth | Supabase |
| Parks Data | National Park Service API |
| Weather | National Weather Service API (free, no key) |
| Maps | Google Maps JavaScript API + Distance Matrix |
| State | nuqs (URL-driven) + TanStack Query |
| Secrets | varlock + pass (GPG-backed) |
| Testing | Vitest + React Testing Library + Playwright |

## Getting Started

### Prerequisites

- Node.js v22 (see `.nvmrc`)
- Supabase project (free tier works)
- NPS API key ([get one here](https://www.nps.gov/subjects/developer/get-started.htm))
- Google Maps API key ([get one here](https://console.cloud.google.com/google/maps-apis))
- GPG + pass setup for secret management (or use `.env.local` for local dev)

### Setup

```bash
git clone https://github.com/stephenburks/ParkReach
cd ParkReach
npm install
```

#### Secrets

This project uses `varlock` with `pass` (GPG) for production secrets. For local
development, you can skip GPG setup and use a plain `.env.local` file:

```bash
cp .env.schema .env.local
```

Then fill in the required keys from `.env.schema`. `.env.local` is gitignored.

#### Database

Run the Supabase migrations in `supabase/migrations/` against your project.

### Running Locally

```bash
npm run dev          # Start dev server on localhost:3000
npm run typecheck    # TypeScript strict mode check
npm run lint         # ESLint (flat config)
npm run test         # Vitest unit tests (watch mode)
npm run test:run     # Vitest single run
```

The app uses Supabase for auth and park data caching. If Supabase isn't configured,
the app degrades gracefully — search and park detail pages fall back to the NPS API
directly.

### Syncing Park Data

Run the park sync to populate accessibility flags, alert summaries, and full-resolution
images from the NPS API:

```bash
curl http://localhost:3000/api/parks/sync
```

This fetches all parks, enriches them with accessibility amenity data and alert status,
and upserts into your Supabase `parks` table. Run it periodically or set up a cron job.

## Accessibility

ParkReach is built with accessibility as a core feature, not an afterthought.

- **WCAG 2.1 AA** target with automated axe-core audits in CI
- Every interactive element has keyboard support and a visible focus ring
- Screen reader announcements for dynamic content updates
- Skip links, focus traps, and proper ARIA landmarks
- Real NPS accessibility data surfaced on every park detail page
- Accessibility filter on the explorer (wheelchair access, braille, ASL, audio description)
- `prefers-reduced-motion` and `forced-colors` support
- Back-to-top button on every page

Accessibility is not just a checklist — the app exists to make national park information
truly usable by everyone, regardless of ability.

## Project Structure

```
src/
  app/                  # Next.js App Router pages and API routes
    api/                # NPS proxy, auth, weather, distance, sync
    parks/[parkCode]/   # Park detail page
    auth/               # Login, verify, error pages
    profile/            # User profile
    trips/[tripId]/     # Trip detail
  components/           # React components
    explorer/           # Skeleton, empty, error, grid, list views
    ui/                 # ShadCN base-nova components
  context/              # Auth, DarkMode, Saves providers
  hooks/                # useParks, useAlerts, useTrips, useProfile, etc.
  lib/                  # Supabase clients, NPS API, utilities
  types/                # TypeScript interfaces
docs/                   # Spec, setup, progress, future features
supabase/migrations/    # Database schema
tests/e2e/              # Playwright tests
```

## License

MIT

---

Built by [Stephen Burks](https://github.com/stephenburks)
