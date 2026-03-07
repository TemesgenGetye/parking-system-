'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { logQrScan } from '@/lib/api/qr-scans';
import { queryKeys } from '@/lib/query-keys';

export function useLogQrScan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (zoneId: string) => logQrScan(zoneId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics.qrUsage });
    },
  });
}
