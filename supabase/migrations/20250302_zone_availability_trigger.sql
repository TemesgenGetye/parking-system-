-- Run this if you already applied schema.sql and need the zone availability trigger + policies
-- Supabase Dashboard → SQL Editor → paste and run

-- Zone availability trigger: mark zone unavailable when session starts, available when session ends
CREATE OR REPLACE FUNCTION update_zone_availability_on_session()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'active' THEN
    UPDATE parking_zones SET available = false, updated_at = now() WHERE id = NEW.zone_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.status = 'active' AND NEW.status IN ('completed', 'cancelled') THEN
    UPDATE parking_zones SET available = true, updated_at = now() WHERE id = NEW.zone_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS zone_availability_on_session_trigger ON parking_sessions;
CREATE TRIGGER zone_availability_on_session_trigger
  AFTER INSERT OR UPDATE ON parking_sessions
  FOR EACH ROW EXECUTE FUNCTION update_zone_availability_on_session();

-- Zone CRUD policies (if missing)
DROP POLICY IF EXISTS "Allow public insert parking_zones" ON parking_zones;
CREATE POLICY "Allow public insert parking_zones"
  ON parking_zones FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update parking_zones" ON parking_zones;
CREATE POLICY "Allow public update parking_zones"
  ON parking_zones FOR UPDATE USING (true);

-- parking_sessions UPDATE (for admin Complete/Cancel)
DROP POLICY IF EXISTS "Allow public update parking_sessions" ON parking_sessions;
CREATE POLICY "Allow public update parking_sessions"
  ON parking_sessions FOR UPDATE USING (true);

-- View grants (if session data not loading)
GRANT SELECT ON parking_sessions_with_zone TO anon;
GRANT SELECT ON parking_sessions_with_zone TO authenticated;
