'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ParkingZone } from '@/types/parking';
import {
  fetchZones,
  fetchZoneById,
  fetchZoneByCode,
  createZone,
  updateZone,
  deleteZone,
} from '@/lib/api/zones';
import { queryKeys } from '@/lib/query-keys';

export function useZones() {
  return useQuery({
    queryKey: queryKeys.zones.all,
    queryFn: fetchZones,
  });
}

export function useZoneById(id: string | null) {
  return useQuery({
    queryKey: queryKeys.zones.detail(id ?? ''),
    queryFn: () => fetchZoneById(id!),
    enabled: !!id,
  });
}

export function useZoneByCode(code: string | null) {
  return useQuery({
    queryKey: queryKeys.zones.byCode(code ?? ''),
    queryFn: () => fetchZoneByCode(code!),
    enabled: !!code,
  });
}

export function useCreateZone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (zone: Omit<ParkingZone, 'id'>) => createZone(zone),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.zones.all });
    },
  });
}

export function useUpdateZone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, zone }: { id: string; zone: Partial<ParkingZone> }) =>
      updateZone(id, zone),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.zones.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.zones.detail(variables.id) });
    },
  });
}

export function useDeleteZone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteZone(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.zones.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions.all });
    },
  });
}
