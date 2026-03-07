'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import StatusBar from '@/components/ui/StatusBar';
import Card from '@/components/ui/Card';
import { useSessions, useUpdateSessionStatus } from '@/hooks';
import { calculatePayment, getDisplayDuration } from '@/utils/parking';
import { getStatusBadgeClass } from '@/utils/statusColors';

export default function AnalyticsDashboard() {
  const { data: sessions = [], isLoading, error, refetch } = useSessions();
  const updateStatus = useUpdateSessionStatus();
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all');
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleCancelSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to cancel this session?')) return;
    try {
      await updateStatus.mutateAsync({ id: sessionId, status: 'cancelled' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('Cancel failed:', err);
      alert(`Failed to cancel: ${msg}`);
    }
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify(filteredSessions, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `parking-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Zone Code', 'Zone Name', 'Plate Number', 'Phone Number', 'Start Time', 'End Time', 'Duration (min)', 'Parking Fee', 'VAT', 'Total', 'Status', 'Created At'];
    const rows = filteredSessions.map(s => [
      s.id,
      s.zone.code,
      s.zone.name,
      s.vehicle.plateNumber,
      s.vehicle.phoneNumber,
      s.startTime.toISOString(),
      s.endTime.toISOString(),
      s.duration,
      s.parkingFee,
      s.vat,
      s.total,
      s.status,
      s.createdAt.toISOString(),
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const dataBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `parking-data-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filteredSessions = useMemo(() => {
    let filtered = sessions;

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(s => s.status === filterStatus);
    }

    // Filter by date range
    const now = new Date();
    if (dateRange === 'today') {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      filtered = filtered.filter(s => s.createdAt >= today);
    } else if (dateRange === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(s => s.createdAt >= weekAgo);
    } else if (dateRange === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(s => s.createdAt >= monthAgo);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(s => {
        const plate = s.vehicle?.plateNumber ?? '';
        const phone = s.vehicle?.phoneNumber ?? '';
        const zoneCode = s.zone?.code ?? '';
        const zoneName = s.zone?.name ?? '';
        return plate.toLowerCase().includes(query) ||
          phone.includes(query) ||
          zoneCode.toLowerCase().includes(query) ||
          zoneName.toLowerCase().includes(query);
      });
    }

    return filtered;
  }, [sessions, filterStatus, dateRange, searchQuery]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalRevenue = filteredSessions.reduce((sum, s) => sum + s.total, 0);
    const activeSessions = filteredSessions.filter(s => s.status === 'active').length;
    const totalSessions = filteredSessions.length;
    const avgDuration = filteredSessions.length > 0
      ? filteredSessions.reduce((sum, s) => sum + s.duration, 0) / filteredSessions.length
      : 0;
    const totalHours = filteredSessions.reduce((sum, s) => sum + (s.duration / 60), 0);

    // Revenue by zone
    const revenueByZone = filteredSessions.reduce((acc, s) => {
      const zoneCode = s.zone.code;
      acc[zoneCode] = (acc[zoneCode] || 0) + s.total;
      return acc;
    }, {} as Record<string, number>);

    // Revenue by day (last 7 days)
    const revenueByDay = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      date.setHours(0, 0, 0, 0);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      
      const dayRevenue = filteredSessions
        .filter(s => s.createdAt >= date && s.createdAt < nextDay)
        .reduce((sum, s) => sum + s.total, 0);
      
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: dayRevenue,
      };
    });

    return {
      totalRevenue,
      activeSessions,
      totalSessions,
      avgDuration: Math.round(avgDuration),
      totalHours: Math.round(totalHours * 100) / 100,
      revenueByZone,
      revenueByDay,
    };
  }, [filteredSessions]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const maxRevenue = Math.max(...stats.revenueByDay.map(d => d.revenue), 1);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-red-600">Failed to load analytics. Check your Supabase connection.</p>
      </div>
    );
  }

  return (
    <div>
      <StatusBar />
      <div className="mx-auto max-w-7xl">
        {/* Action buttons */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
            title="Refresh data"
          >
            <svg className="inline h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
          <button
            onClick={handleExportCSV}
            className="rounded-2xl border-2 border-red-600 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
          >
            Export CSV
          </button>
          <button
            onClick={handleExportData}
            className="rounded-2xl border-2 border-red-600 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
          >
            Export JSON
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card variant="accent">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-100">Total Revenue</p>
                <p className="mt-1 text-3xl font-bold text-white">
                  {stats.totalRevenue.toFixed(2)} ETB
                </p>
              </div>
              <div className="rounded-2xl bg-white/20 p-3">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Sessions</p>
                <p className="mt-1 text-3xl font-bold text-gray-900">{stats.activeSessions}</p>
              </div>
              <div className="rounded-full bg-amber-100 p-3">
                <svg className="h-6 w-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Sessions</p>
                <p className="mt-1 text-3xl font-bold text-gray-900">{stats.totalSessions}</p>
              </div>
              <div className="rounded-full bg-green-100 p-3">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Hours</p>
                <p className="mt-1 text-3xl font-bold text-gray-900">{stats.totalHours}h</p>
                <p className="mt-1 text-xs text-gray-500">Avg: {Math.round(stats.avgDuration)} min</p>
              </div>
              <div className="rounded-full bg-gray-100 p-3">
                <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </Card>
        </div>

        {/* Revenue Chart */}
        <Card className="mb-6">
          <h2 className="mb-4 text-xl font-bold text-gray-900">Revenue Trend (Last 7 Days)</h2>
          <div className="flex items-end justify-between gap-2 h-48">
            {stats.revenueByDay.map((day, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="relative w-full flex items-end justify-center h-40">
                  <div
                    className="w-full bg-red-600 rounded-t transition-all hover:bg-red-700"
                    style={{ height: `${(day.revenue / maxRevenue) * 100}%` }}
                    title={`${day.date}: ${day.revenue.toFixed(2)} ETB`}
                  />
                </div>
                <p className="mt-2 text-xs text-gray-600">{day.date}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Revenue by Zone */}
        <Card className="mb-6">
          <h2 className="mb-4 text-xl font-bold text-gray-900">Revenue by Zone</h2>
          <div className="space-y-3">
            {Object.entries(stats.revenueByZone)
              .sort(([, a], [, b]) => b - a)
              .map(([zone, revenue]) => (
                <div key={zone}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700">{zone}</span>
                    <span className="font-semibold text-black">{revenue.toFixed(2)} ETB</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-200">
                    <div
                      className="h-2 rounded-full bg-red-600"
                      style={{
                        width: `${(revenue / stats.totalRevenue) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </Card>

        {/* Filters */}
        <Card className="mb-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by plate, phone, or zone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-black focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-black focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as any)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-black focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Sessions Table */}
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">All Parking Sessions</h2>
            <span className="text-sm text-gray-600">{filteredSessions.length} sessions</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                    Zone
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                    Vehicle
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                    Phone
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                    Duration
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                    Start Time
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredSessions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                      No parking sessions found
                    </td>
                  </tr>
                ) : (
                  filteredSessions.map((session) => (
                    <tr key={session.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 shrink-0 rounded-full bg-slate-500" aria-hidden />
                          <div>
                            <p className="font-semibold text-black">{session.zone.code}</p>
                            <p className="text-xs text-gray-500">{session.zone.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <p className="font-medium text-black">{session.vehicle.plateNumber}</p>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <p className="text-gray-700">{session.vehicle.phoneNumber}</p>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <p className="text-gray-700">
                          {(() => {
                            const mins = getDisplayDuration(session);
                            return `${Math.floor(mins / 60)}h ${mins % 60}m`;
                          })()}
                          {session.status === 'active' && (
                            <span className="ml-1 text-xs text-amber-600">(ongoing)</span>
                          )}
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <p className="text-sm text-gray-700">{formatDate(session.startTime)}</p>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <p className="font-semibold text-black">
                          {session.status === 'active'
                            ? calculatePayment(
                                getDisplayDuration(session),
                                session.zone.hourlyRate
                              ).total.toFixed(2)
                            : session.total.toFixed(2)}{' '}
                          ETB
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(
                            session.status,
                            { withBorder: true }
                          )}`}
                        >
                          {session.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <div className="flex gap-2">
                          {session.status === 'active' && (
                            <>
                              <Link
                                href={`/complete/${session.id}`}
                                className="rounded bg-red-600 px-2 py-1 text-xs font-medium text-white hover:bg-red-700 transition-colors"
                                title="Complete session"
                              >
                                Complete
                              </Link>
                              <button
                                onClick={() => handleCancelSession(session.id)}
                                disabled={updateStatus.isPending}
                                className="rounded bg-red-800 px-2 py-1 text-xs font-medium text-white hover:bg-red-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Cancel session"
                              >
                                {updateStatus.isPending ? '...' : 'Cancel'}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
