# Future Features

Features deferred from the initial build. Pick these up once the relevant prerequisite is met.

---

## Apple Sign In

**Blocked by:** Paid Apple Developer account ($99/year)

**What's needed:**
1. Enroll at https://developer.apple.com
2. Create an App ID and a Services ID for ParkReach
3. Register the production domain under the Services ID
4. Add the Services ID and private key to Supabase Auth → Apple provider settings
5. Add Apple's redirect URI (`https://parkreach.app/api/auth/callback`) to the Services ID

**Where to wire it in:** `src/app/auth/login/page.tsx` — there is a TODO comment marking the exact location. Add a "Continue with Apple" button using `supabase.auth.signInWithOAuth({ provider: 'apple' })`.

**Notes:** Apple Sign In requires HTTPS and a real domain — it will not work on `localhost` without a tunnel (e.g. ngrok). Test on staging before production.

---

## Passkeys (WebAuthn)

**Blocked by:** Supabase WebAuthn support reaching GA

**What's needed:**
- Monitor https://github.com/supabase/supabase/issues for passkey/WebAuthn GA announcement
- Once available, add a "Use a passkey" button to `src/app/auth/login/page.tsx` (TODO comment marks the location)
- No schema changes needed — Supabase manages WebAuthn credentials internally

---

## OG Image Generation

**Priority:** Low

Dynamically generated Open Graph images for park detail pages using Next.js `ImageResponse`. Would use the park's hero image + name + designation overlaid on a branded template.

**Where:** `src/app/parks/[parkCode]/opengraph-image.tsx`

---

## Admin-Curated Park of the Day

**Priority:** Low

Replace the deterministic algorithm with an admin-picked park, stored in Supabase. Requires an admin UI or a simple Supabase dashboard edit. Only worth building if the project gets regular users.

---

## Trip Planning

**Priority:** Medium (post-launch)

Allow users to group wishlisted parks into named trips, add notes and target dates. Requires a `trips` and `trip_parks` table in Supabase.
