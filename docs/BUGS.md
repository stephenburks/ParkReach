# ParkReach — Bug & Improvement Tracker

Log bugs and improvements here. Review periodically during planning.

##格式

```markdown
### [Type] Title

**Status:** open | in-progress | done
**Phase:** Phase # | General
**Priority:** high | medium | low

Description of the issue.

**Steps to reproduce (bugs):**
1. 

**Proposed fix (bugs):**
- 

**Suggested improvement:**
- 
```

---

## Open Items

### [Bug] Auth modal - Google sign in throws error

**Status:** closed — removed from UI
**Phase:** Phase 2
**Priority:** high

Google OAuth button was removed from AuthModal as of May 2026. Magic link is the
sole auth method. Revisit for Phase 9 when OAuth is re-prioritized.

---

### [Bug] Auth button shows "Loading..." for too long

**Status:** done
**Phase:** Phase 2
**Priority:** high

Fixed — now shows `animate-pulse` skeleton instead of "Loading..." text.

---

### [Improvement] Auth modal - Add error handling

**Status:** done
**Phase:** Phase 2
**Priority:** medium

Fixed — try/catch with user-facing error message added to MagicLinkForm.

---

### [Improvement] Magic link copy improvement

**Status:** done
**Phase:** Phase 2
**Priority:** low

Fixed — button now reads "Send Email Code".

---

### [Improvement] Email format validation

**Status:** done
**Phase:** Phase 2
**Priority:** low

Fixed — `isValidEmail()` validation added to MagicLinkForm.

---

### [Improvement] Add profile URL link

**Status:** done
**Phase:** Phase 3
**Priority:** low

Fixed — `Link href="/profile"` with User icon in AuthButton.

---

### [Bug] Filtering returns inconsistent number of results

**Status:** in-progress
**Phase:** Phase 3
**Priority:** high

Designation filter now fetches all parks and filters client-side with `buildDesignationList()`
built dynamically from loaded data. Normalization simplified to exact match (removed brittle
`replace(/s$/, '')`). Both tab values and park designations come from the same Supabase
source. Monitor after next data sync.

---

### [Improvement] Optimize NPS API usage with caching or local database

**Status:** done — Supabase is now primary data source
**Phase:** Phase 4
**Priority:** high

Parks data is synced from NPS to Supabase `parks` table via `/api/parks/sync` (cron, daily).
Explorer queries Supabase first; NPS API only used for detail page enrichment and
detail-page sub-endpoints (alerts, thingstodo, campgrounds, etc.). All routes cached with
`s-maxage` headers.

---

### [Bug] Map view is buggy

**Status:** deferred
**Phase:** Phase 9
**Priority:** high

Map view was removed entirely and `ParkMap.tsx` deleted. `react-leaflet` was dropped.
Pending Google Maps reimplementation using `@vis.gl/react-google-maps` (already installed).

---

### [Improvement] Add minimal list view

**Status:** done
**Phase:** Phase 4
**Priority:** medium

Done — `ParkCardMinimal` + `ParkListView` shipped. View toggle between cards/minimal works.

---

### [Improvement] Add accessibility filter

**Status:** done — real boolean filter, requires data sync
**Phase:** Phase 4
**Priority:** medium

Accessibility filter rebuilt on real Supabase boolean fields (has_wheelchair_access, has_braille,
has_asl, has_audio_description). Filter works once `/api/parks/sync` cron populates the columns
with data from NPS `/amenities` endpoint.

---

### [Improvement] Add News section

**Status:** done
**Phase:** Phase 5
**Priority:** medium

Done — `NewsSection` component wired to park detail page, fetching from `/api/news`
(NPS `/newsreleases` endpoint).