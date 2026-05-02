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

**Status:** open
**Phase:** Phase 2
**Priority:** high

Clicking "Continue with Google" throws a JSON error page instead of redirecting.

**Steps to reproduce:**
1. Click "Sign in" button in header
2. Click "Continue with Google"
3. Error page appears

**Proposed fix:**
- Check AuthContext signIn function redirect URL
- Verify Supabase Google provider is configured in dashboard

---

### [Bug] Auth button shows "Loading..." for too long

**Status:** open
**Phase:** Phase 2
**Priority:** high

The Sign in button shows "Loading..." state before determining if user is authenticated.

**Proposed fix:**
- Add timeout or skeleton state instead of "Loading..."
- Show button immediately, update after auth check

---

### [Improvement] Auth modal - Add error handling

**Status:** open
**Phase:** Phase 2
**Priority:** medium

Magic link sign in has no error handling if it fails.

**Proposed fix:**
- Add try/catch with user-facing error message
- Show "Failed to send magic link" with retry option

---

### [Improvement] Magic link copy improvement

**Status:** open
**Phase:** Phase 2
**Priority:** low

"magic link" is unfamiliar terminology. Change to "one-time code" or "email code".

**Proposed fix:**
- Update button text to "Send Email Code"
- Update success message to reference the code

---

### [Improvement] Email format validation

**Status:** open
**Phase:** Phase 2
**Priority:** low

Email input should validate format before submitting.

**Proposed fix:**
- Add HTML5 validation or custom validation message
- Show inline error for invalid email

---

### [Improvement] Add profile URL link

**Status:** open
**Phase:** Phase 3
**Priority:** low

When signed in, user name/avatar should link to /profile page.

**Proposed fix:**
- Add link to profile in header when authenticated

---

### [Bug] Filtering returns inconsistent number of results

**Status:** open
**Phase:** Phase 3
**Priority:** high

When filtering by designation (e.g., "National Parks"), the results may include other similar designations (e.g., "National Historic Parks", parks) or return fewer/more results than expected.

**Steps to reproduce:**
1. Select "National Parks" from designation filter
2. Note the count of results
3. Refresh or navigate away and return
4. Count may differ

**Proposed fix:**
- Add logging to see what designations NPS API returns
- Consider creating a local designation map for more reliable filtering
- Alternatively, fetch all parks once and filter client-side with full designation matching

---

### [Improvement] Optimize NPS API usage with caching or local database

**Status:** open
**Phase:** General
**Priority:** high

NPS API has rate limits and costs. Currently fetching from API on each request. Need to optimize to avoid hitting limits and reduce latency.

**Proposed fix:**
- **Option A: Server-side caching** — Implement Redis or similar cache with TTL (e.g., 1 hour) to cache API responses
- **Option B: Local database** — Create a cron job to sync parks to local PostgreSQL/Supabase table daily
- **Option C: Static generation** — Use ISR to build parks weekly, regenerate periodically
- Consider first: Add caching layer (fastify-cache or similar)

---

### [Bug] Map view is buggy

**Status:** open
**Phase:** Phase 4
**Priority:** high

Map view using react-leaflet is buggy - markers don't load, icons missing, or blank map in Next.js.

**Proposed fix:**
- Disable map view for now
- Revisit with simpler map solution (static map image, Google Maps, or use NPS GeoJSON data from nationalparkservice/data)

---

### [Improvement] Add accessibility filter

**Status:** open
**Phase:** Phase 4
**Priority:** medium

Add accessibility filter dropdown to SearchFilter (UI exists but NPS API doesn't expose accessibility data in parks endpoint).

**Proposed fix:**
- Requires NPS API to add accessibility fields, or
- Scrape accessibility data from park detail pages, or
- Manual curation in local database
- Alternative: Show "Accessibility info available on detail page" badge on cards

---

### [Improvement] Add News tab

**Status:** open
**Phase:** Future
**Priority:** medium

Add a "News" tab to show national parks news and information.

**Proposed fix:**
- Use NPS API `/news` endpoint
- Add news as a separate tab or section alongside designation tabs
- Display park-related news articles