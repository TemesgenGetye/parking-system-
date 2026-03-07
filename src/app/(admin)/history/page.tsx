'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import StatusBar from '@/components/ui/StatusBar';
import Card from '@/components/ui/Card';
import type { ParkingSession } from '@/types/parking';
import { useSessions, useUpdateSessionStatus } from '@/hooks';
import { getDisplayDuration, calculatePayment } from '@/utils/parking';
import { getStatusBadgeClass } from '@/utils/statusColors';

const PAGE_SIZE = 8;

type TabType = 'active' | 'completed' | 'cancelled';

function matchesSearch(session: ParkingSession, query: string): boolean {
  if (!query.trim()) return true;
  const q = query.trim().toLowerCase();
  const plate = session.vehicle.plateNumber?.toLowerCase() ?? '';
  const phone = session.vehicle.phoneNumber?.toLowerCase() ?? '';
  const zone = session.zone.code?.toLowerCase() ?? '';
  const name = session.vehicle.name?.toLowerCase() ?? '';
  return plate.includes(q) || phone.includes(q) || zone.includes(q) || name.includes(q);
}

export default function HistoryPage() {
  const [activeTab, setActiveTab] = useState<TabType>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [zoneFilter, setZoneFilter] = useState<string>('all');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const { data: sessions = [], isLoading, error } = useSessions();

  const activeSessions = sessions.filter((s) => s.status === 'active');
  const completedSessions = sessions.filter((s) => s.status === 'completed');
  const cancelledSessions = sessions.filter((s) => s.status === 'cancelled');

  const tabSessions =
    activeTab === 'active'
      ? activeSessions
      : activeTab === 'completed'
        ? completedSessions
        : cancelledSessions;

  const currentTabSessions = tabSessions.filter((s) => {
    if (!matchesSearch(s, searchQuery)) return false;
    if (zoneFilter !== 'all' && s.zone.code !== zoneFilter) return false;
    return true;
  });

  const visibleSessions = currentTabSessions.slice(0, visibleCount);
  const hasMore = visibleCount < currentTabSessions.length;

  const uniqueZones = Array.from(
    new Set(
      tabSessions
        .map((s) => s.zone.code)
        .filter(Boolean)
        .sort()
    )
  );

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [activeTab, searchQuery, zoneFilter]);

  useEffect(() => {
    if (!hasMore || !sentinelRef.current) return;
    const el = sentinelRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((n) => Math.min(n + PAGE_SIZE, currentTabSessions.length));
        }
      },
      { rootMargin: '100px', threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, currentTabSessions.length]);

  const updateStatus = useUpdateSessionStatus();

  const handleCancelSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to cancel this session?')) return;
    try {
      await updateStatus.mutateAsync({ id: sessionId, status: 'cancelled' });
    } catch (err: unknown) {
      alert(`Failed to cancel: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-600">Loading history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-red-600">Failed to load history. Check your Supabase connection.</p>
      </div>
    );
  }

  return (
    <div>
      <StatusBar />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {sessions.length === 0 ? (
          <Card>
            <div className="py-8 text-center">
              <svg
                className="mx-auto mb-4 h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-gray-600">No parking sessions yet</p>
              <p className="mt-2 text-sm text-gray-500">Book your first parking session to get started</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {/* Tabs */}
            <div className="flex gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1">
              {(['active', 'completed', 'cancelled'] as const).map((tab) => {
                const dotClass =
                  tab === 'active'
                    ? 'bg-amber-500'
                    : tab === 'completed'
                      ? 'bg-green-500'
                      : 'bg-gray-500';
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-colors ${
                      activeTab === tab
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <span className={`h-2 w-2 shrink-0 rounded-full ${dotClass}`} aria-hidden />
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    <span className="text-xs text-gray-500">
                      ({tab === 'active' ? activeSessions.length : tab === 'completed' ? completedSessions.length : cancelledSessions.length})
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search and filter */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <div className="relative flex-1">
                <svg
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="search"
                  placeholder="Search by plate, phone, zone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label="Clear search"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <label htmlFor="zone-filter" className="text-sm font-medium text-gray-700">
                  Zone:
                </label>
                <select
                  id="zone-filter"
                  value={zoneFilter}
                  onChange={(e) => setZoneFilter(e.target.value)}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                >
                  <option value="all">All zones</option>
                  {uniqueZones.map((code) => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tab content - responsive grid: 1 col mobile, 2 tablet, 4 desktop */}
            <section>
              {currentTabSessions.length === 0 ? (
                <Card>
                  <div className="py-8 text-center text-gray-500">
                    {searchQuery || zoneFilter !== 'all'
                      ? 'No sessions match your search or filter'
                      : `No ${activeTab} sessions`}
                  </div>
                </Card>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
                    {visibleSessions.map((session) => (
                      <SessionCard
                        key={session.id}
                        session={session}
                        onCancel={activeTab === 'active' ? handleCancelSession : undefined}
                        getStatusBadgeClass={getStatusBadgeClass}
                        getDisplayDuration={getDisplayDuration}
                        calculatePayment={calculatePayment}
                        isUpdating={updateStatus.isPending}
                      />
                    ))}
                  </div>
                  {hasMore && (
                    <div ref={sentinelRef} className="flex h-12 items-center justify-center py-4">
                      <span className="text-sm text-gray-400">Loading more...</span>
                    </div>
                  )}
                </>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

function SessionCard({
  session,
  onCancel,
  getStatusBadgeClass,
  getDisplayDuration,
  calculatePayment,
  isUpdating,
}: {
  session: ParkingSession;
  onCancel?: (id: string) => void;
  getStatusBadgeClass: (status: string) => string;
  getDisplayDuration: (s: { startTime: Date; duration: number; status: string }) => number;
  calculatePayment: (duration: number, rate: number) => { total: number };
  isUpdating?: boolean;
}) {
  const shortDate = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
  return (
    <Card className="p-3 sm:p-4">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-wide text-gray-500 sm:text-xs">Zone</p>
            <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-slate-500" aria-hidden />
            <p className="truncate text-base font-bold text-black sm:text-lg">{session.zone.code}</p>
          </span>
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-1">
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize sm:px-2.5 sm:py-1 sm:text-xs ${getStatusBadgeClass(
              session.status
            )}`}
          >
            {session.status}
          </span>
          {session.status === 'active' && onCancel && (
            <>
              <Link
                href={`/complete/${session.id}`}
                className="rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-medium text-white hover:bg-red-700 sm:px-2 sm:py-1 sm:text-xs"
              >
                Complete
              </Link>
              <button
                onClick={() => onCancel(session.id)}
                disabled={isUpdating}
                className="rounded bg-red-800 px-1.5 py-0.5 text-[10px] font-medium text-white hover:bg-red-900 disabled:opacity-50 sm:px-2 sm:py-1 sm:text-xs"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      <div className="space-y-1 border-t border-gray-200 pt-2">
        <div className="flex justify-between gap-2 text-xs">
          <span className="text-gray-500">Plate</span>
          <span className="truncate font-medium text-black">{session.vehicle.plateNumber}</span>
        </div>
        <div className="flex justify-between gap-2 text-xs">
          <span className="text-gray-500">Phone</span>
          <span className="truncate font-medium text-black">{session.vehicle.phoneNumber}</span>
        </div>
        <div className="flex justify-between gap-2 text-xs">
          <span className="text-gray-500">Duration</span>
          <span className="font-medium text-black">
            {(() => {
              const mins = getDisplayDuration(session);
              return `${Math.floor(mins / 60)}h ${mins % 60}m`;
            })()}
            {session.status === 'active' && (
              <span className="ml-0.5 text-red-600">·</span>
            )}
          </span>
        </div>
      </div>

      <div className="mt-2 space-y-1 border-t border-gray-200 pt-2">
        <div className="flex justify-between gap-2 text-xs">
          <span className="text-gray-500">Start</span>
          <span className="truncate text-black">{shortDate(session.startTime)}</span>
        </div>
        <div className="flex justify-between gap-2 text-xs">
          <span className="text-gray-500">End</span>
          <span className="truncate text-black">
            {session.status === 'active' ? 'Ongoing' : shortDate(session.endTime)}
          </span>
        </div>
        <div className="mt-1.5 flex justify-between border-t border-gray-200 pt-1.5">
          <span className="text-xs font-semibold text-black">Total</span>
          <span className="text-sm font-bold text-black sm:text-base">
            {session.status === 'active'
              ? calculatePayment(
                  getDisplayDuration(session),
                  session.zone.hourlyRate
                ).total.toFixed(2)
              : session.total.toFixed(2)}{' '}
            ETB
          </span>
        </div>
      </div>
    </Card>
  );
}
