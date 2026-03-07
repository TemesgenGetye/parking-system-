import { supabase } from '@/lib/supabase/client';

export async function logQrScan(zoneId: string): Promise<void> {
  const { error } = await supabase.from('qr_scan_events').insert({ zone_id: zoneId });
  if (error) throw error;
}
