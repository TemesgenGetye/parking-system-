import { supabase } from '@/lib/supabase/client';
import type {
  AnalyticsDailySummaryRow,
  AnalyticsByZoneRow,
  AnalyticsQrUsageRow,
} from '@/lib/supabase/types';

export async function fetchDailySummary(): Promise<AnalyticsDailySummaryRow[]> {
  const { data, error } = await supabase
    .from('analytics_daily_summary')
    .select('*')
    .order('date', { ascending: false })
    .limit(30);

  if (error) throw error;
  return data as AnalyticsDailySummaryRow[];
}

export async function fetchAnalyticsByZone(): Promise<AnalyticsByZoneRow[]> {
  const { data, error } = await supabase
    .from('analytics_by_zone')
    .select('*')
    .order('total_revenue', { ascending: false });

  if (error) throw error;
  return data as AnalyticsByZoneRow[];
}

export async function fetchQrUsage(): Promise<AnalyticsQrUsageRow[]> {
  const { data, error } = await supabase
    .from('analytics_qr_usage')
    .select('*')
    .order('scan_count', { ascending: false });

  if (error) throw error;
  return data as AnalyticsQrUsageRow[];
}
