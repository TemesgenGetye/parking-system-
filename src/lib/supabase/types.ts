export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface ParkingZoneRow {
  id: string;
  name: string;
  code: string;
  hourly_rate: number;
  available: boolean;
  created_at: string;
  updated_at: string;
}

export interface ParkingSessionRow {
  id: string;
  zone_id: string;
  vehicle_phone: string;
  vehicle_plate: string;
  vehicle_name: string | null;
  start_time: string;
  end_time: string;
  duration: number;
  parking_fee: number;
  vat: number;
  total: number;
  status: 'active' | 'completed' | 'cancelled';
  source: 'admin' | 'user_portal';
  created_at: string;
  updated_at: string;
}

export interface ParkingSessionWithZoneRow extends ParkingSessionRow {
  zone_name: string;
  zone_code: string;
  hourly_rate: number;
}

export interface ZoneAuditLogRow {
  id: string;
  zone_id: string | null;
  action: 'created' | 'updated' | 'deleted';
  old_data: Json | null;
  new_data: Json | null;
  created_at: string;
}

export interface QrScanEventRow {
  id: string;
  zone_id: string;
  scanned_at: string;
}

export interface SessionAuditLogRow {
  id: string;
  session_id: string | null;
  action: 'created' | 'status_changed' | 'cancelled';
  old_status: string | null;
  new_status: string | null;
  created_at: string;
}

export interface AnalyticsDailySummaryRow {
  date: string;
  total_sessions: number;
  active_sessions: number;
  completed_sessions: number;
  total_revenue: number;
  total_parking_fee: number;
  total_vat: number;
}

export interface AnalyticsByZoneRow {
  zone_id: string;
  zone_name: string;
  zone_code: string;
  hourly_rate: number;
  total_sessions: number;
  active_sessions: number;
  completed_sessions: number;
  total_revenue: number;
}

export interface AnalyticsQrUsageRow {
  zone_id: string;
  zone_name: string;
  zone_code: string;
  scan_count: number;
  last_scanned_at: string | null;
}
