-- ============================================
-- Selam Parking System - Full Database Schema
-- Run in Supabase SQL Editor (Dashboard > SQL Editor > New query)
-- Covers: Booking, Zones, History, Analytics, QR Codes, User Portal, Success
-- ============================================

-- ============================================
-- TABLES OVERVIEW
-- ============================================
-- parking_zones      → Zones tab, QR Codes tab, User portal
-- parking_sessions   → Booking, History, Analytics, User portal, Success
-- payments          → Payment tracking
-- zone_audit_log    → Zones tab (change history)
-- qr_scan_events    → QR Codes tab, Analytics (scan tracking)
-- session_audit_log → History tab (session change tracking)
-- ============================================

-- 1. PARKING ZONES
-- Used by: Zones tab (CRUD), QR Codes tab, User portal, Booking
CREATE TABLE IF NOT EXISTS parking_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  hourly_rate DECIMAL(10, 2) NOT NULL DEFAULT 15,
  available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. PARKING SESSIONS
-- Used by: Booking tab, History tab, Analytics tab, User portal, Success page
CREATE TABLE IF NOT EXISTS parking_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id UUID NOT NULL REFERENCES parking_zones(id) ON DELETE CASCADE,
  vehicle_phone TEXT NOT NULL,
  vehicle_plate TEXT NOT NULL,
  vehicle_name TEXT,
  start_time TIMESTAMPTZ NOT NULL DEFAULT now(),
  end_time TIMESTAMPTZ NOT NULL,
  duration INTEGER NOT NULL,
  parking_fee DECIMAL(10, 2) NOT NULL,
  vat DECIMAL(10, 2) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  source TEXT NOT NULL DEFAULT 'user_portal' CHECK (source IN ('admin', 'user_portal')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. PAYMENTS
-- Used by: Payment integration, Analytics
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES parking_sessions(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method TEXT CHECK (payment_method IN ('cash', 'card', 'mobile', 'other')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. ZONE AUDIT LOG
-- Used by: Zones tab (change history), Analytics
CREATE TABLE IF NOT EXISTS zone_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id UUID REFERENCES parking_zones(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (action IN ('created', 'updated', 'deleted')),
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. QR SCAN EVENTS
-- Used by: QR Codes tab, Analytics (which zones get most scans)
CREATE TABLE IF NOT EXISTS qr_scan_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id UUID NOT NULL REFERENCES parking_zones(id) ON DELETE CASCADE,
  scanned_at TIMESTAMPTZ DEFAULT now()
);

-- 6. SESSION AUDIT LOG
-- Used by: History tab (status changes), Analytics
CREATE TABLE IF NOT EXISTS session_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES parking_sessions(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (action IN ('created', 'status_changed', 'cancelled')),
  old_status TEXT,
  new_status TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. INDEXES
CREATE INDEX IF NOT EXISTS idx_parking_sessions_zone_id ON parking_sessions(zone_id);
CREATE INDEX IF NOT EXISTS idx_parking_sessions_status ON parking_sessions(status);
CREATE INDEX IF NOT EXISTS idx_parking_sessions_created_at ON parking_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_parking_sessions_start_time ON parking_sessions(start_time);
CREATE INDEX IF NOT EXISTS idx_parking_sessions_source ON parking_sessions(source);
CREATE INDEX IF NOT EXISTS idx_payments_session_id ON payments(session_id);
CREATE INDEX IF NOT EXISTS idx_zone_audit_log_zone_id ON zone_audit_log(zone_id);
CREATE INDEX IF NOT EXISTS idx_zone_audit_log_created_at ON zone_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_qr_scan_events_zone_id ON qr_scan_events(zone_id);
CREATE INDEX IF NOT EXISTS idx_qr_scan_events_scanned_at ON qr_scan_events(scanned_at DESC);
CREATE INDEX IF NOT EXISTS idx_session_audit_log_session_id ON session_audit_log(session_id);
CREATE INDEX IF NOT EXISTS idx_session_audit_log_created_at ON session_audit_log(created_at DESC);

-- 8. UPDATED_AT TRIGGER
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_parking_zones_updated_at ON parking_zones;
CREATE TRIGGER update_parking_zones_updated_at
  BEFORE UPDATE ON parking_zones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_parking_sessions_updated_at ON parking_sessions;
CREATE TRIGGER update_parking_sessions_updated_at
  BEFORE UPDATE ON parking_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 9. ZONE AUDIT TRIGGER (log create/update/delete)
-- SECURITY DEFINER: runs as owner to bypass RLS on zone_audit_log
-- DELETE uses zone_id=NULL since the zone row no longer exists
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

DROP TRIGGER IF EXISTS zone_audit_trigger ON parking_zones;
CREATE TRIGGER zone_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON parking_zones
  FOR EACH ROW EXECUTE FUNCTION log_zone_changes();

-- 10. SESSION AUDIT TRIGGER (log create and status changes)
CREATE OR REPLACE FUNCTION log_session_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO session_audit_log (session_id, action, new_status)
    VALUES (NEW.id, 'created', NEW.status);
  ELSIF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO session_audit_log (session_id, action, old_status, new_status)
    VALUES (NEW.id, 'status_changed', OLD.status, NEW.status);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS session_audit_trigger ON parking_sessions;
CREATE TRIGGER session_audit_trigger
  AFTER INSERT OR UPDATE ON parking_sessions
  FOR EACH ROW EXECUTE FUNCTION log_session_changes();

-- Zone availability: mark unavailable when session starts, available when session ends
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

-- Prevent double-booking: only one active session per zone
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

-- 11. ROW LEVEL SECURITY
ALTER TABLE parking_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE parking_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE zone_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_scan_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read parking_zones" ON parking_zones;
CREATE POLICY "Allow public read parking_zones"
  ON parking_zones FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert parking_zones" ON parking_zones;
CREATE POLICY "Allow public insert parking_zones"
  ON parking_zones FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update parking_zones" ON parking_zones;
CREATE POLICY "Allow public update parking_zones"
  ON parking_zones FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete parking_zones" ON parking_zones;
CREATE POLICY "Allow public delete parking_zones"
  ON parking_zones FOR DELETE USING (true);

DROP POLICY IF EXISTS "Allow public read parking_sessions" ON parking_sessions;
CREATE POLICY "Allow public read parking_sessions"
  ON parking_sessions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert parking_sessions" ON parking_sessions;
CREATE POLICY "Allow public insert parking_sessions"
  ON parking_sessions FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update parking_sessions" ON parking_sessions;
CREATE POLICY "Allow public update parking_sessions"
  ON parking_sessions FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete parking_sessions" ON parking_sessions;
CREATE POLICY "Allow public delete parking_sessions"
  ON parking_sessions FOR DELETE USING (true);

-- zone_audit_log: trigger inserts when zone created/updated/deleted
DROP POLICY IF EXISTS "Allow public insert zone_audit_log" ON zone_audit_log;
CREATE POLICY "Allow public insert zone_audit_log"
  ON zone_audit_log FOR INSERT WITH CHECK (true);

-- Payments: service role only (no public policy)
DROP POLICY IF EXISTS "Allow public insert qr_scan_events" ON qr_scan_events;
CREATE POLICY "Allow public insert qr_scan_events"
  ON qr_scan_events FOR INSERT WITH CHECK (true);

-- session_audit_log: trigger inserts when session created (anon can create sessions)
DROP POLICY IF EXISTS "Allow public insert session_audit_log" ON session_audit_log;
CREATE POLICY "Allow public insert session_audit_log"
  ON session_audit_log FOR INSERT WITH CHECK (true);

-- 12. SEED DEFAULT ZONES
INSERT INTO parking_zones (name, code, hourly_rate, available) VALUES
  ('Downtown', 'LK0804', 15, true),
  ('City Center', 'LK0805', 20, true),
  ('Airport', 'LK0806', 25, true),
  ('Mall', 'LK0807', 18, false),
  ('Residential', 'LK0808', 12, true)
ON CONFLICT (code) DO NOTHING;

-- 13. VIEWS FOR HISTORY & ANALYTICS TABS
CREATE OR REPLACE VIEW parking_sessions_with_zone AS
SELECT
  s.id,
  s.zone_id,
  s.vehicle_phone,
  s.vehicle_plate,
  s.vehicle_name,
  s.start_time,
  s.end_time,
  s.duration,
  s.parking_fee,
  s.vat,
  s.total,
  s.status,
  s.source,
  s.created_at,
  z.name AS zone_name,
  z.code AS zone_code,
  z.hourly_rate
FROM parking_sessions s
JOIN parking_zones z ON s.zone_id = z.id;

-- Grant SELECT on views to anon (required for Supabase client)
GRANT SELECT ON parking_sessions_with_zone TO anon;
GRANT SELECT ON parking_sessions_with_zone TO authenticated;

-- 14. ANALYTICS VIEWS
CREATE OR REPLACE VIEW analytics_daily_summary AS
SELECT
  DATE(created_at) AS date,
  COUNT(*) AS total_sessions,
  COUNT(*) FILTER (WHERE status = 'active') AS active_sessions,
  COUNT(*) FILTER (WHERE status = 'completed') AS completed_sessions,
  SUM(total) AS total_revenue,
  SUM(parking_fee) AS total_parking_fee,
  SUM(vat) AS total_vat
FROM parking_sessions
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Analytics by zone (revenue, sessions per zone)
CREATE OR REPLACE VIEW analytics_by_zone AS
SELECT
  z.id AS zone_id,
  z.name AS zone_name,
  z.code AS zone_code,
  z.hourly_rate,
  COUNT(s.id) AS total_sessions,
  COUNT(s.id) FILTER (WHERE s.status = 'active') AS active_sessions,
  COUNT(s.id) FILTER (WHERE s.status = 'completed') AS completed_sessions,
  COALESCE(SUM(s.total), 0) AS total_revenue
FROM parking_zones z
LEFT JOIN parking_sessions s ON s.zone_id = z.id
GROUP BY z.id, z.name, z.code, z.hourly_rate
ORDER BY total_revenue DESC;

-- QR scan analytics (which zones get most scans)
CREATE OR REPLACE VIEW analytics_qr_usage AS
SELECT
  z.id AS zone_id,
  z.name AS zone_name,
  z.code AS zone_code,
  COUNT(q.id) AS scan_count,
  MAX(q.scanned_at) AS last_scanned_at
FROM parking_zones z
LEFT JOIN qr_scan_events q ON q.zone_id = z.id
GROUP BY z.id, z.name, z.code
ORDER BY scan_count DESC;

GRANT SELECT ON analytics_daily_summary TO anon;
GRANT SELECT ON analytics_by_zone TO anon;
GRANT SELECT ON analytics_qr_usage TO anon;
