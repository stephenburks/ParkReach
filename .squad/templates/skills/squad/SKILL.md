---
name: "squad"
description: "Invoke the Mystery Inc. squad for ParkReach project tasks"
domain: "project-management"
confidence: "high"
source: "manual"
---

## Context

Use this skill when the user wants to leverage the full Mystery Inc. squad to work on a project phase or feature. The squad consists of:

- **Fred** — Lead Architect (charter: `.squad/agents/fred/charter.md`)
- **Daphne** — Frontend Developer (charter: `.squad/agents/daphne/charter.md`)
- **Velma** — Backend Developer (charter: `.squad/agents/velma/charter.md`)
- **Shaggy** — Test Engineer & ADA/WCAG Specialist (charter: `.squad/agents/shaggy/charter.md`)
- **Scooby** — Code Reviewer (charter: `.squad/agents/scooby/charter.md`)
- **Scrappy** — Scribe/Documentation (charter: `.squad/agents/scrappy/charter.md`)

## Patterns

### Invoking the Squad

1. **Read the team config**: First read `.squad/team.md` and relevant agent charters to understand current state
2. **Read the task context**: Read `.squad/roster.md`, current phase from `docs/PROGRESS.md`, and relevant spec from `docs/SPEC.md`
3. **Assign work in parallel**: Use the `task` tool to launch multiple agents simultaneously for independent tasks
4. **Coordinate handoffs**: After initial work, route outputs to appropriate next agents
5. **Review gate**: Send final work to Scooby for code review before completion

### Agent Selection Guidelines

| Task Type | Agent(s) |
|-----------|----------|
| Architecture/system design | Fred |
| React/UI components, frontend features | Daphne |
| API routes, backend, database, auth | Velma |
| Testing, accessibility (WCAG) audits | Shaggy |
| Code review, quality checks | Scooby |
| Documentation updates, progress tracking | Scrappy |

### Coordination Flow

For a typical feature task:
1. Start with Fred to plan/architect
2. Assign parallel work to Daphne + Velma for frontend/backend
3. Have Shaggy verify tests and accessibility
4. Send to Scooby for review
5. Scrappy updates progress docs

## Examples

```
User: "Run Phase 0 setup with the team"
→ Read SPEC.md Phase 0 section
→ Launch: Fred (plan), Daphne (shadcn), Velma (supabase clients)
→ Coordinate results
→ Shaggy (verify), Scooby (review)
→ Scrappy (update PROGRESS.md)
```

## Anti-Patterns

- Don't assign all work to one agent — the squad is meant for parallel execution
- Don't skip the review gate with Scooby
- Don't forget to update PROGRESS.md after completing work