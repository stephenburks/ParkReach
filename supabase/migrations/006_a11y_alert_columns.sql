-- Migration 006: Accessibility and alert columns for parks
-- Enables server-side filtering on accessibility features and alert status

ALTER TABLE parks ADD COLUMN IF NOT EXISTS has_accessible_restrooms BOOLEAN DEFAULT false;
ALTER TABLE parks ADD COLUMN IF NOT EXISTS has_wheelchair_access BOOLEAN DEFAULT false;
ALTER TABLE parks ADD COLUMN IF NOT EXISTS has_braille BOOLEAN DEFAULT false;
ALTER TABLE parks ADD COLUMN IF NOT EXISTS has_asl BOOLEAN DEFAULT false;
ALTER TABLE parks ADD COLUMN IF NOT EXISTS has_audio_description BOOLEAN DEFAULT false;
ALTER TABLE parks ADD COLUMN IF NOT EXISTS has_service_animal_relief BOOLEAN DEFAULT false;
ALTER TABLE parks ADD COLUMN IF NOT EXISTS alert_count INT DEFAULT 0;
ALTER TABLE parks ADD COLUMN IF NOT EXISTS has_closure BOOLEAN DEFAULT false;
ALTER TABLE parks ADD COLUMN IF NOT EXISTS has_danger BOOLEAN DEFAULT false;
ALTER TABLE parks ADD COLUMN IF NOT EXISTS alert_level TEXT;

CREATE INDEX IF NOT EXISTS idx_parks_has_wheelchair ON parks (has_wheelchair_access);
CREATE INDEX IF NOT EXISTS idx_parks_alert_level ON parks (alert_level);
