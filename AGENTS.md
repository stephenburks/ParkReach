<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# ParkReach — Agent Guidelines

## Project Docs

- `docs/SPEC.md` — full product spec, schema, file list, implementation phases
- `docs/SETUP.md` — external services setup (Supabase, Google Cloud, domain)
- `docs/FUTURE_FEATURES.md` — deferred features (Apple Sign In, passkeys, OG images)

## Key Rules

- **Read `docs/SPEC.md` before starting any phase.** Understand which phase you are implementing and what it depends on.
- **Do not implement features from `docs/FUTURE_FEATURES.md`.** Add a TODO comment at the relevant location instead.
- **Never hardcode secrets.** All API keys and credentials go through `varlock` + `pass`. See `.env.schema` for the current list.
- **Placeholder domain is `parkreach.app`.** Use it in canonical URLs, OG tags, and redirect URIs until the real domain is set.
- **Accessibility is not optional.** Every interactive element needs keyboard support and a visible focus ring. Follow WCAG 2.1 AA throughout — not just in Phase 8.
- **ShadCN + Tailwind.** Use ShadCN components for UI elements. Use Tailwind utilities for layout and one-offs. Do not reach for custom CSS unless Tailwind genuinely cannot cover it.
- **Server Components by default.** Only add `'use client'` when the component needs browser APIs, event handlers, or React state. Keep data fetching in RSCs.
- **URL-driven state.** View mode (`?view=`), filters, and search query live in URL params so they are shareable and bookmarkable.
