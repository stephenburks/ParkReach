# ParkReach — Copilot Instructions

You are working on **ParkReach**, an accessibility-first national parks explorer.
Read these files before writing any code:

1. `docs/PROGRESS.md` — **start here**. Current phase, what's done, where we left off.
2. `docs/SPEC.md` — full product spec: schema, file list, implementation phases, SEO, performance, accessibility requirements.
3. `docs/SETUP.md` — external services that need configuring (Supabase, Google Cloud, domain).
4. `docs/FUTURE_FEATURES.md` — deferred features. Do not implement these; add TODO comments instead.
5. `AGENTS.md` — ground rules for all agents working on this project.

## Stack
Next.js 16 (App Router) · TypeScript (strict) · Tailwind CSS v4 · ShadCN · Supabase · NPS API · National Weather Service API · Google Maps

## Hard Rules
- Never hardcode secrets — all credentials go through `varlock` + `pass`. See `.env.schema`.
- Accessibility is not optional. WCAG 2.1 AA throughout, not just in the audit phase.
- Server Components by default. Only add `'use client'` when genuinely needed.
- ShadCN for UI components, Tailwind utilities for layout and one-offs.
- URL-driven state for view mode, filters, and search.
- Placeholder domain is `parkreach.app` until a real domain is confirmed.
- Commits use conventional format: `type(scope): message`

## Code Style
- Tabs for indentation
- Single quotes in JS/TS
- `const` by default, `let` only when reassignment is needed
- `async/await` over Promise chains
- Early returns over nested conditionals
