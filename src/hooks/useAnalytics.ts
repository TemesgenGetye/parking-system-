'use client';

import { useQuery } from '@tanstack/react-query';
import {
  fetchDailySummary,
  fetchAnalyticsByZone,
  fetchQrUsage,
} from '@/lib/api/analytics';
import { queryKeys } from '@/lib/query-keys';

export function useDailySummary() {
  return useQuery({
    queryKey: queryKeys.analytics.dailySummary,
    queryFn: fetchDailySummary,
  });
}

export function useAnalyticsByZone() {
  return useQuery({
    queryKey: queryKeys.analytics.byZone,
    queryFn: fetchAnalyticsByZone,
  });
}

export function useQrUsage() {
  return useQuery({
    queryKey: queryKeys.analytics.qrUsage,
    queryFn: fetchQrUsage,
  });
}
