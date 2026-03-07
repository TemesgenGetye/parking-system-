import { supabase } from '@/lib/supabase/client';
import type { ParkingZone } from '@/types/parking';
import { mapZoneRowToZone, mapZoneToRow } from '@/lib/supabase/mappers';
import type { ParkingZoneRow } from '@/lib/supabase/types';

export async function fetchZones(): Promise<ParkingZone[]> {
  const { data, error } = await supabase
    .from('parking_zones')
    .select('*')
    .order('code', { ascending: true });

  if (error) throw new Error(error.message);
  return (data as ParkingZoneRow[]).map(mapZoneRowToZone);
}

export async function fetchZoneById(id: string): Promise<ParkingZone | null> {
  const { data, error } = await supabase
    .from('parking_zones')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(error.message);
  }
  return data ? mapZoneRowToZone(data as ParkingZoneRow) : null;
}

export async function fetchZoneByCode(code: string): Promise<ParkingZone | null> {
  const { data, error } = await supabase
    .from('parking_zones')
    .select('*')
    .eq('code', code)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(error.message);
  }
  return data ? mapZoneRowToZone(data as ParkingZoneRow) : null;
}

export async function createZone(zone: Omit<ParkingZone, 'id'>): Promise<ParkingZone> {
  const row = {
    name: zone.name,
    code: zone.code,
    hourly_rate: Number(zone.hourlyRate) || 0,
    available: zone.available ?? true,
  };
  const { data, error } = await supabase
    .from('parking_zones')
    .insert(row)
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return mapZoneRowToZone(data as ParkingZoneRow);
}

export async function updateZone(id: string, zone: Partial<ParkingZone>): Promise<ParkingZone> {
  const row = mapZoneToRow(zone);
  const cleanRow: Record<string, unknown> = {};
  if (row.name !== undefined) cleanRow.name = row.name;
  if (row.code !== undefined) cleanRow.code = row.code;
  if (row.hourly_rate !== undefined) cleanRow.hourly_rate = row.hourly_rate;
  if (row.available !== undefined) cleanRow.available = row.available;

  const { data, error } = await supabase
    .from('parking_zones')
    .update(cleanRow)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return mapZoneRowToZone(data as ParkingZoneRow);
}

export async function deleteZone(id: string): Promise<void> {
  // After running the migration, ON DELETE CASCADE handles sessions automatically.
  // If migration not run yet, manual session delete may be needed (but requires DELETE policy).
  const { error } = await supabase.from('parking_zones').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
