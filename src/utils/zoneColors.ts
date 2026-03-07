/**
 * Consistent zone availability color codes used across the app.
 * Available = Green (can park), Unavailable = Gray (stopped)
 */
export const ZONE_COLORS = {
  available: {
    badge: 'bg-green-100 text-green-800',
    badgeWithBorder: 'bg-green-100 text-green-800 border-green-200',
    icon: 'bg-green-100 text-green-600',
    dot: 'bg-green-500',
    card: 'border-green-200 bg-green-50',
  },
  unavailable: {
    badge: 'bg-gray-200 text-gray-700',
    badgeWithBorder: 'bg-gray-200 text-gray-700 border-gray-300',
    icon: 'bg-gray-100 text-gray-600',
    dot: 'bg-gray-500',
    card: 'border-gray-200 bg-gray-50',
  },
} as const;

/** Returns Tailwind classes for zone availability badges. Use `withBorder: true` for bordered contexts. */
export function getZoneBadgeClass(
  available: boolean,
  options?: { withBorder?: boolean }
): string {
  const key = available ? 'available' : 'unavailable';
  return options?.withBorder
    ? ZONE_COLORS[key].badgeWithBorder
    : ZONE_COLORS[key].badge;
}
