export const queryKeys = {
  zones: {
    all: ['zones'] as const,
    detail: (id: string) => ['zones', id] as const,
    byCode: (code: string) => ['zones', 'code', code] as const,
  },
  sessions: {
    all: ['sessions'] as const,
    detail: (id: string) => ['sessions', id] as const,
    byZone: (zoneId: string) => ['sessions', 'zone', zoneId] as const,
  },
  analytics: {
    dailySummary: ['analytics', 'dailySummary'] as const,
    byZone: ['analytics', 'byZone'] as const,
    qrUsage: ['analytics', 'qrUsage'] as const,
  },
} as const;
