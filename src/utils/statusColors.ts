/**
 * Consistent status color codes used across the app.
 * Active = Amber (in progress), Completed = Green (success), Cancelled = Gray (stopped)
 */
export type SessionStatus = 'active' | 'completed' | 'cancelled';

export const STATUS_COLORS = {
  active: {
    badge: 'bg-amber-100 text-amber-800',
    badgeWithBorder: 'bg-amber-100 text-amber-800 border-amber-200',
    icon: 'bg-amber-100 text-amber-600',
    dot: 'bg-amber-500',
  },
  completed: {
    badge: 'bg-green-100 text-green-800',
    badgeWithBorder: 'bg-green-100 text-green-800 border-green-200',
    icon: 'bg-green-100 text-green-600',
    dot: 'bg-green-500',
  },
  cancelled: {
    badge: 'bg-gray-200 text-gray-700',
    badgeWithBorder: 'bg-gray-200 text-gray-700 border-gray-300',
    icon: 'bg-gray-100 text-gray-600',
    dot: 'bg-gray-500',
  },
} as const;

/** Returns Tailwind classes for status badges (pills). Use `withBorder: true` for bordered contexts like tables. */
export function getStatusBadgeClass(
  status: string,
  options?: { withBorder?: boolean }
): string {
  const key = status as SessionStatus;
  if (key in STATUS_COLORS) {
    return options?.withBorder
      ? STATUS_COLORS[key].badgeWithBorder
      : STATUS_COLORS[key].badge;
  }
  return options?.withBorder
    ? 'bg-gray-100 text-gray-800 border-gray-200'
    : 'bg-gray-100 text-gray-800';
}
