-- Migration 005: Allow sync route to write to parks table
-- The sync route runs server-side with a cookie-authenticated client.
-- These policies allow insert/update when called from the server context.

CREATE POLICY "Sync route can insert parks"
	ON parks
	FOR INSERT
	WITH CHECK (true);

CREATE POLICY "Sync route can update parks"
	ON parks
	FOR UPDATE
	USING (true)
	WITH CHECK (true);
