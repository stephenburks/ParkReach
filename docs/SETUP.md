# ParkReach — External Services Setup

This file tracks setup steps for external services that are not yet complete.
Update each section as you complete the steps.

---

## Production Domain

**Status:** Not set up — using placeholder `parkreach.app`

Anywhere in the codebase or docs that references `parkreach.app` is a placeholder.
When you have a real domain, find and replace it:

```bash
grep -r "parkreach.app" .
```

Update in:
- Supabase Auth → URL Configuration → Site URL and Redirect URLs
- Google Cloud Console → OAuth 2.0 credentials → Authorized redirect URIs
- Google Cloud Console → API key HTTP referrer restrictions

---

## Supabase

**Status:** Not set up

1. Create a project at https://supabase.com
2. Copy your project URL and anon key into your `pass` store:
   ```bash
   pass insert parkreach/supabase-url
   pass insert parkreach/supabase-anon-key
   ```
3. Update `.env.schema` references to use `pass("parkreach/supabase-url")` etc.
4. Enable Auth providers in Supabase dashboard:
   - Email → Magic Link (disable password sign-in)
   - Google (requires Google Cloud setup below)
   - Enable "Link accounts by email" in Auth → Settings
5. Set Redirect URLs in Supabase Auth → URL Configuration:
   - `http://localhost:3000/api/auth/callback` (development)
   - `https://parkreach.app/api/auth/callback` (replace with real domain)
6. Run the SQL migrations in `supabase/migrations/` to create tables

---

## Google Cloud

**Status:** Not set up

### Step 1 — Create a Project
1. Go to https://console.cloud.google.com
2. Create a new project named "ParkReach"
3. Enable the following APIs:
   - Maps JavaScript API
   - Distance Matrix API
   - Geocoding API (optional, for future use)

### Step 2 — Create API Keys

**Public Maps key** (used in the browser — visible in JS bundle):
1. Credentials → Create Credentials → API Key
2. Name it `ParkReach Maps (Public)`
3. Under "Application restrictions" → HTTP referrers, add:
   - `http://localhost:3000/*`
   - `https://parkreach.app/*` (replace with real domain)
4. Under "API restrictions" → Restrict to: Maps JavaScript API only
5. Store in pass: `pass insert parkreach/google-maps-public-key`

**Private Distance Matrix key** (server-only — never exposed to the browser):
1. Credentials → Create Credentials → API Key
2. Name it `ParkReach Distance Matrix (Server)`
3. Under "Application restrictions" → None (or IP restriction if on a fixed server)
4. Under "API restrictions" → Restrict to: Distance Matrix API only
5. Store in pass: `pass insert parkreach/google-maps-server-key`

> **Why two keys?** The public key is embedded in your frontend JS and visible to anyone.
> Restricting it to your domain means even if someone copies it, it won't work on their site.
> The server key is only used in `/api/distance` (a Next.js API route) and never sent to the browser,
> so it doesn't need a referrer restriction — but it should be restricted to just the Distance Matrix API
> to limit blast radius if it ever leaks.

### Step 3 — OAuth for Google Sign In
1. Credentials → Create Credentials → OAuth 2.0 Client ID
2. Application type: Web application
3. Name: `ParkReach Web`
4. Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback`
   - `https://parkreach.app/api/auth/callback` (replace with real domain)
5. Copy the Client ID and Client Secret into Supabase Auth → Google provider

---

## National Weather Service

**Status:** Ready — no setup needed

The NWS API (https://api.weather.gov) is free with no API key required.
The app calls it server-side via `/api/weather` to avoid CORS issues.

---

## National Park Service API

**Status:** Active

Key is stored in `pass` at `nps/api-key` and referenced in `.env.schema`.
Get a new key at https://www.nps.gov/subjects/developer/get-started.htm if needed.
