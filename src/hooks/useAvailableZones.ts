'use client';

import { useMemo } from 'react';
import { useZones } from './useZones';
import { useSessions } from './useSessions';
import type { ParkingZone } from '@/types/parking';

/** Zones that are available for booking: zone.available AND no active session in that zone */
export function useAvailableZones(): {
  zones: ParkingZone[];
  availableZones: ParkingZone[];
  isLoading: boolean;
  error: Error | null;
} {
  const { data: zones = [], isLoading: zonesLoading, error: zonesError } = useZones();
  const { data: sessions = [], isLoading: sessionsLoading } = useSessions();

  const { zones: zonesWithEffectiveAvailability, availableZones } = useMemo(() => {
    const zoneIdsWithActiveSession = new Set(
      sessions.filter((s) => s.status === 'active').map((s) => s.zone.id)
    );
    const withAvailability = zones.map((z) => ({
      ...z,
      available: z.available && !zoneIdsWithActiveSession.has(z.id),
    }));
    const available = withAvailability.filter((z) => z.available);
    return { zones: withAvailability, availableZones: available };
  }, [zones, sessions]);

  return {
    zones: zonesWithEffectiveAvailability,
    availableZones,
    isLoading: zonesLoading || sessionsLoading,
    error: zonesError,
  };
}
