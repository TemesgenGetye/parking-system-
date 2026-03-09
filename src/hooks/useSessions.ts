'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ParkingSession } from '@/types/parking';
import {
  fetchSessions,
  fetchSessionById,
  fetchSessionsByZone,
  createSession,
  updateSessionStatus,
  completeSessionWithFinalValues,
} from '@/lib/api/sessions';
import { queryKeys } from '@/lib/query-keys';

export function useSessions() {
  return useQuery({
    queryKey: queryKeys.sessions.all,
    queryFn: fetchSessions,
  });
}

export function useSessionById(id: string | null, options?: { refetchInterval?: number }) {
  return useQuery({
    queryKey: queryKeys.sessions.detail(id ?? ''),
    queryFn: () => fetchSessionById(id!),
    enabled: !!id,
    refetchOnMount: 'always',
    ...(options?.refetchInterval !== undefined && { refetchInterval: options.refetchInterval }),
  });
}

export function useSessionsByZone(zoneId: string | null) {
  return useQuery({
    queryKey: queryKeys.sessions.byZone(zoneId ?? ''),
    queryFn: () => fetchSessionsByZone(zoneId!),
    enabled: !!zoneId,
  });
}

export function useCreateSession(source: 'admin' | 'user_portal' = 'user_portal') {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (session: Omit<ParkingSession, 'id' | 'createdAt'>) =>
      createSession(session, source),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.zones.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics.dailySummary });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics.byZone });
    },
  });
}

export function useUpdateSessionStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'active' | 'completed' | 'cancelled' }) =>
      updateSessionStatus(id, status),
    onSuccess: async (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.zones.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics.dailySummary });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics.byZone });
      await queryClient.refetchQueries({ queryKey: queryKeys.sessions.all });
      await queryClient.refetchQueries({ queryKey: queryKeys.zones.all });
    },
  });
}

export function useCompleteSessionWithFinalValues() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      endTime,
      duration,
      parkingFee,
      vat,
      total,
    }: {
      id: string;
      endTime: Date;
      duration: number;
      parkingFee: number;
      vat: number;
      total: number;
    }) => completeSessionWithFinalValues(id, endTime, duration, parkingFee, vat, total),
    onSuccess: async (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.zones.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics.dailySummary });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics.byZone });
      await queryClient.refetchQueries({ queryKey: queryKeys.sessions.all });
      await queryClient.refetchQueries({ queryKey: queryKeys.zones.all });
    },
  });
}
