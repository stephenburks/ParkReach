-- Security fixes for park_saves RLS and handle_new_user trigger

-- Fix 1: Add WITH CHECK to park_saves policy so INSERT/UPDATE
-- also enforce that the row belongs to the authenticated user.
-- Previously, USING alone only filtered reads — a malicious client
-- could insert rows with an arbitrary user_id.
DROP POLICY "Users can manage own park saves" ON park_saves;

CREATE POLICY "Users can manage own park saves" ON park_saves
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Fix 2: Pin search_path on the SECURITY DEFINER trigger function.
-- Without this, a schema with objects shadowing public.profiles could
-- be injected before this function runs.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, display_name, avatar_url)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;
