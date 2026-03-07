-- Fix zone delete, edit, and add
-- Run this in Supabase SQL Editor: Dashboard > SQL Editor > New query

-- 1. Add INSERT policy for zone_audit_log (trigger needs this when zones are added/edited/deleted)
DROP POLICY IF EXISTS "Allow public insert zone_audit_log" ON zone_audit_log;
CREATE POLICY "Allow public insert zone_audit_log"
  ON zone_audit_log FOR INSERT WITH CHECK (true);

-- 2. Add DELETE policies (missing - causes delete to fail)
DROP POLICY IF EXISTS "Allow public delete parking_sessions" ON parking_sessions;
CREATE POLICY "Allow public delete parking_sessions"
  ON parking_sessions FOR DELETE USING (true);

DROP POLICY IF EXISTS "Allow public delete parking_zones" ON parking_zones;
CREATE POLICY "Allow public delete parking_zones"
  ON parking_zones FOR DELETE USING (true);

-- 3. Change FK to ON DELETE CASCADE so deleting a zone auto-deletes its sessions
ALTER TABLE parking_sessions
  DROP CONSTRAINT IF EXISTS parking_sessions_zone_id_fkey;

ALTER TABLE parking_sessions
  ADD CONSTRAINT parking_sessions_zone_id_fkey
  FOREIGN KEY (zone_id) REFERENCES parking_zones(id) ON DELETE CASCADE;

-- 4. Fix zone_audit_log trigger: use SECURITY DEFINER to bypass RLS, and use NULL zone_id for deletes
CREATE OR REPLACE FUNCTION log_zone_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO zone_audit_log (zone_id, action, new_data)
    VALUES (NEW.id, 'created', to_jsonb(NEW));
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO zone_audit_log (zone_id, action, old_data, new_data)
    VALUES (NEW.id, 'updated', to_jsonb(OLD), to_jsonb(NEW));
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO zone_audit_log (zone_id, action, old_data)
    VALUES (NULL, 'deleted', to_jsonb(OLD));
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;
