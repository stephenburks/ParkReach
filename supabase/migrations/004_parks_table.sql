-- Migration 004: Parks data sync
-- Creates a local parks cache table for instant loads and reliable filtering

CREATE TABLE parks (
	park_code TEXT PRIMARY KEY,
	full_name TEXT NOT NULL,
	description TEXT,
	states TEXT NOT NULL,
	designation TEXT,
	latitude TEXT,
	longitude TEXT,
	image_url TEXT,
	image_alt TEXT,
	url TEXT,
	updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE parks ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Parks are publicly readable"
	ON parks
	FOR SELECT
	USING (true);

CREATE INDEX idx_parks_designation ON parks (designation);
CREATE INDEX idx_parks_states ON parks (states);
