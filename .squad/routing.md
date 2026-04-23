# Work Routing

How to decide who handles what.

## Routing Table

| Work Type | Route To | Examples |
|-----------|----------|----------|
| Architecture / system design | Fred | Module boundaries, data flow, API contracts, ADRs |
| React / Next.js UI | Daphne | Components, pages, layouts, client state, accessibility |
| Node.js / API / backend | Velma | Route Handlers, Server Actions, DB, integrations |
| Testing / QA | Shaggy | Unit tests, integration tests, Playwright e2e |
| Accessibility / ADA / WCAG audits | Shaggy | a11y audits, axe scans, keyboard/screen reader passes, WCAG compliance gating |
| Code review / quality gate | Scooby | PR reviews, standards, cross-agent review coordination |
| Issue triage | Fred | Incoming `squad`-labeled issues, assignment |
| Session logging | Scrappy | Automatic — never needs routing |
| Cross-session memory | Hex Girls | Automatic — surfaces prior context |

## Issue Routing

| Label | Action | Who |
|-------|--------|-----|
| `squad` | Triage: analyze issue, assign `squad:{member}` label | Lead |
| `squad:{name}` | Pick up issue and complete the work | Named member |

### How Issue Assignment Works

1. When a GitHub issue gets the `squad` label, the **Lead** triages it — analyzing content, assigning the right `squad:{member}` label, and commenting with triage notes.
2. When a `squad:{member}` label is applied, that member picks up the issue in their next session.
3. Members can reassign by removing their label and adding another member's label.
4. The `squad` label is the "inbox" — untriaged issues waiting for Lead review.

## Rules

1. **Eager by default** — spawn all agents who could usefully start work, including anticipatory downstream work.
2. **Scrappy always runs** after substantial work, always as `mode: "background"`. Never blocks.
3. **Quick facts → coordinator answers directly.** Don't spawn an agent for "what port does the server run on?"
4. **When two agents could handle it**, pick the one whose domain is the primary concern.
5. **"Team, ..." → fan-out.** Spawn all relevant agents in parallel as `mode: "background"`.
6. **Anticipate downstream work.** If a feature is being built, spawn the tester to write test cases from requirements simultaneously — and Shaggy in parallel for an accessibility pass on any UI change.
7. **Issue-labeled work** — when a `squad:{member}` label is applied to an issue, route to that member. The Lead handles all `squad` (base label) triage.
