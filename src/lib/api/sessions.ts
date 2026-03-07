import { supabase } from '@/lib/supabase/client';
import type { ParkingSession } from '@/types/parking';
import { mapSessionRowToSession, mapSessionToRow } from '@/lib/supabase/mappers';
import type { ParkingSessionRow, ParkingSessionWithZoneRow } from '@/lib/supabase/types';

export async function fetchSessions(): Promise<ParkingSession[]> {
  const { data, error } = await supabase
    .from('parking_sessions_with_zone')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as ParkingSessionWithZoneRow[]).map((row) => mapSessionRowToSession(row));
}

export async function fetchSessionById(id: string): Promise<ParkingSession | null> {
  const { data, error } = await supabase
    .from('parking_sessions_with_zone')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data ? mapSessionRowToSession(data as ParkingSessionWithZoneRow) : null;
}

export async function fetchSessionsByZone(zoneId: string): Promise<ParkingSession[]> {
  const { data, error } = await supabase
    .from('parking_sessions_with_zone')
    .select('*')
    .eq('zone_id', zoneId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as ParkingSessionWithZoneRow[]).map((row) => mapSessionRowToSession(row));
}

export async function createSession(
  session: Omit<ParkingSession, 'id' | 'createdAt'>,
  source: 'admin' | 'user_portal' = 'user_portal'
): Promise<ParkingSession> {
  const row = mapSessionToRow(session, source);
  const { data, error } = await supabase
    .from('parking_sessions')
    .insert(row)
    .select('*')
    .single();

  if (error) throw error;

  const sessionData = data as ParkingSessionRow;
  const zone = {
    id: sessionData.zone_id,
    name: session.zone.name,
    code: session.zone.code,
    hourlyRate: session.zone.hourlyRate,
    available: session.zone.available,
  };
  return mapSessionRowToSession(sessionData, zone);
}

export async function updateSessionStatus(
  id: string,
  status: 'active' | 'completed' | 'cancelled'
): Promise<void> {
  const { error } = await supabase
    .from('parking_sessions')
    .update({ status })
    .eq('id', id);

  if (error) throw error;
}

export async function completeSessionWithFinalValues(
  id: string,
  endTime: Date,
  duration: number,
  parkingFee: number,
  vat: number,
  total: number
): Promise<void> {
  const { error } = await supabase
    .from('parking_sessions')
    .update({
      status: 'completed',
      end_time: endTime.toISOString(),
      duration,
      parking_fee: parkingFee,
      vat,
      total,
    })
    .eq('id', id);

  if (error) throw error;
}
