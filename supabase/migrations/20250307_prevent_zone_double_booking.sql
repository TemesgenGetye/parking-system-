-- Prevent double-booking: only one active session per zone
-- Run in Supabase SQL Editor: Dashboard > SQL Editor > New query

CREATE OR REPLACE FUNCTION check_zone_available_for_session()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status != 'active' THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF EXISTS (SELECT 1 FROM parking_sessions WHERE zone_id = NEW.zone_id AND status = 'active') THEN
      RAISE EXCEPTION 'This parking spot is already occupied. Please select another zone.';
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF EXISTS (SELECT 1 FROM parking_sessions WHERE zone_id = NEW.zone_id AND status = 'active' AND id != NEW.id) THEN
      RAISE EXCEPTION 'This parking spot is already occupied. Please select another zone.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS check_zone_before_session_insert ON parking_sessions;
CREATE TRIGGER check_zone_before_session_insert
  BEFORE INSERT ON parking_sessions
  FOR EACH ROW EXECUTE FUNCTION check_zone_available_for_session();

DROP TRIGGER IF EXISTS check_zone_before_session_update ON parking_sessions;
CREATE TRIGGER check_zone_before_session_update
  BEFORE UPDATE ON parking_sessions
  FOR EACH ROW EXECUTE FUNCTION check_zone_available_for_session();
