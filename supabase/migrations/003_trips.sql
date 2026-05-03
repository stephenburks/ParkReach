-- Trip planning: named groups of parks

CREATE TABLE trips (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
	name text NOT NULL,
	description text,
	created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "trips_owner" ON trips
	USING (auth.uid() = user_id)
	WITH CHECK (auth.uid() = user_id);

-- Parks belonging to a trip

CREATE TABLE trip_parks (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	trip_id uuid NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
	park_code text NOT NULL,
	notes text,
	added_at timestamptz DEFAULT now() NOT NULL,
	UNIQUE (trip_id, park_code)
);

ALTER TABLE trip_parks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "trip_parks_owner" ON trip_parks
	USING (
		auth.uid() = (SELECT user_id FROM trips WHERE id = trip_id)
	)
	WITH CHECK (
		auth.uid() = (SELECT user_id FROM trips WHERE id = trip_id)
	);
