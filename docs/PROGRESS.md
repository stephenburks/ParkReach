# ParkReach — Progress Tracker

Update this file at the end of every session. Any AI assistant picking up this
project should read this file first.

---

## Current Status

**Active phase:** Phase 1 — Database and Auth Backend
**Last updated:** 2026-05-02

---

## Phase Checklist

- [x] **Phase 0** — Setup and Dependencies (ShadCN, Supabase clients, bundle analyzer, middleware)
- [ ] **Phase 1** — Database and Auth Backend (migrations, TypeScript types, callback route)
- [ ] **Phase 2** — Auth UI (login/verify/error pages, AuthContext, AuthButton)
- [ ] **Phase 3** — Dark Mode and Profile (useDarkMode, CSS variables, profile page, useParkSaves)
- [ ] **Phase 4** — Explorer Views (ViewToggle, ParkCardMinimal, ParkMap, accessibility filter)
- [ ] **Phase 5** — Park Detail and Save Actions (detail page, weather, distance, save buttons)
- [ ] **Phase 6** — Park of the Day (ParkOfTheDay RSC, hero section)
- [ ] **Phase 7** — SEO and Sitemap (generateMetadata, sitemap.ts, robots.ts, JSON-LD)
- [ ] **Phase 8** — Accessibility Audit (WCAG 2.1 AA pass, Axe, keyboard walkthrough)

---

## External Services Checklist

- [x] NPS API key — stored in `pass` at `nps/api-key`
- [ ] Supabase project — see `docs/SETUP.md`
- [ ] Google Cloud project + API keys — see `docs/SETUP.md`
- [ ] Production domain — using `parkreach.app` as placeholder

---

## Decisions Log

Record any decisions made during implementation that aren't obvious from the code.

| Date | Decision | Reason |
|---|---|---|
| 2026-05-01 | Deferred Apple Sign In | Requires paid Apple Developer account |
| 2026-05-01 | Deferred passkeys | Supabase WebAuthn support not yet GA |
| 2026-05-01 | Using `pass` instead of Bitwarden | Bitwarden Secrets Manager requires paid org plan |
| 2026-05-01 | Placeholder domain: `parkreach.app` | No production domain yet — find/replace when confirmed |

---

## Session Notes

### 2026-05-01
- Moved project files from `jrny-agentic-squad-poc/` up to `Accessible Parks/` root
- Set up varlock + `@varlock/nextjs-integration` for env var security
- Configured `pass` (GPG) as the secrets backend — NPS API key stored at `nps/api-key`
- Merged `feature/park-viewer` → `main`
- Created `docs/SPEC.md`, `docs/SETUP.md`, `docs/FUTURE_FEATURES.md`, `AGENTS.md`
- Created `.github/copilot-instructions.md` for Copilot context
- **Ready to start Phase 0**

### 2026-05-02
- Invoked Mystery Inc. squad (Fred, Daphne, Velma, Shaggy, Scooby) for Phase 0
- **Daphne**: Initialized ShadCN (slate, CSS variables), created robots.ts, sitemap.ts stubs
- **Velma**: Installed Supabase/SSR, Google Maps packages, bundle analyzer; created middleware.ts, supabase client/server helpers
- **Shaggy**: Verified npm install passes, identified build failure (expected - Supabase not set up yet)
- **Scooby**: Code review - flagged middleware error handling, fixed
- **Fixes applied**: Added try/catch to middleware.ts auth refresh
- **Blockers**: Build fails until Supabase is set up (Phase 1)
- **Next**: Phase 1 - Database and Auth Backend

---

## How to Update This File

At the end of each session, add an entry under Session Notes:
```
### YYYY-MM-DD
- What was completed
- Any decisions made (add to Decisions Log too)
- Any blockers discovered
- Exactly where to pick up next
```

Check off completed phases in the checklist above.
