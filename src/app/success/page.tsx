'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import StatusBar from '@/components/ui/StatusBar';
import { calculatePayment, formatDuration, formatCurrency } from '@/utils/parking';
import { useSessionById } from '@/hooks';

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session');

  const { data: session, isLoading, error } = useSessionById(sessionId, {
    refetchInterval: (query) =>
      query.state.data?.status === 'active' ? 3000 : false,
  });
  const [elapsedMinutes, setElapsedMinutes] = useState(0);
  const [currentPayment, setCurrentPayment] = useState({ parkingFee: 0, vat: 0, total: 0 });

  useEffect(() => {
    if (!session?.zone) return;

    const hourlyRate = Number(session.zone.hourlyRate) || 0;
    const tick = () => {
      const start = session.startTime.getTime();
      const now = Date.now();
      const mins = Math.max(0, Math.floor((now - start) / 60000));
      setElapsedMinutes(mins);
      const payment = calculatePayment(mins, hourlyRate);
      setCurrentPayment(payment);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [session]);

  if (!sessionId) {
    return (
      <div className="min-h-screen bg-white">
        <StatusBar />
        <main className="mx-auto max-w-md px-4 pb-8 sm:px-6">
          <div className="flex min-h-[60vh] flex-col items-center justify-center">
            <h1 className="mb-2 text-2xl font-bold text-black">Parking Session</h1>
            <p className="mb-8 text-center text-gray-600">No active session found.</p>
          </div>
        </main>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <StatusBar />
        <p className="text-gray-600">Loading session...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <StatusBar />
        <p className="text-red-600">Session not found.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <StatusBar />
        <p className="text-red-600">Failed to load session. Check your connection.</p>
      </div>
    );
  }

  const isActive = session.status === 'active';
  const isCompleted = session.status === 'completed';
  const isCancelled = session.status === 'cancelled';

  const displayDuration = isActive ? elapsedMinutes : session.duration;
  const displayPayment = isActive
    ? currentPayment
    : { parkingFee: session.parkingFee, vat: session.vat, total: session.total };

  return (
    <div className="min-h-screen bg-[#F8F9FB]">
      <StatusBar />
      <main className="mx-auto max-w-md px-4 pb-8 sm:px-6">
        <div className="pt-6 space-y-6">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-full ${
                isActive ? 'bg-amber-100' : isCompleted ? 'bg-green-100' : 'bg-gray-200'
              }`}
            >
              {isActive ? (
                <svg
                  className="h-8 w-8 text-amber-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              ) : isCompleted ? (
                <svg
                  className="h-8 w-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                <svg
                  className="h-8 w-8 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold text-black">
                {isActive && 'Parking Active'}
                {isCompleted && 'Session Completed'}
                {isCancelled && 'Session Cancelled'}
              </h1>
              <p className="text-sm text-gray-600">
                Zone {session.zone.code} · {session.zone.name}
              </p>
            </div>
          </div>

          <div
            className={`rounded-2xl ring-2 p-6 text-center shadow-sm ${
              isActive
                ? 'ring-amber-200/50 bg-amber-50'
                : isCompleted
                  ? 'ring-green-200/50 bg-green-50'
                  : 'ring-gray-200/50 bg-gray-100'
            }`}
          >
            <p className="text-sm font-medium text-gray-600 mb-1">
              {isActive ? 'Time Parked' : 'Total Duration'}
            </p>
            <p
              className={`text-4xl font-bold tabular-nums ${
                isActive ? 'text-amber-700' : isCompleted ? 'text-green-700' : 'text-gray-700'
              }`}
            >
              {formatDuration(displayDuration)}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Rate: {session.zone.hourlyRate} ETB / hour
            </p>
          </div>

          {isCancelled ? (
            <div className="rounded-2xl bg-white ring-1 ring-gray-200/50 p-6 shadow-sm">
              <p className="text-center text-gray-600">
                This parking session was cancelled by the admin.
              </p>
              <p className="text-center text-sm text-gray-500 mt-2">
                No payment is required.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl bg-white ring-1 ring-gray-200/50 p-6 space-y-4 shadow-sm">
              <p className="text-sm font-medium text-gray-600">
                {isActive ? 'Current Charges' : 'Final Charges'}
              </p>
              <div className="flex justify-between text-base">
                <span className="text-gray-700">Parking fee</span>
                <span className="font-semibold text-black">
                  {formatCurrency(displayPayment.parkingFee)}
                </span>
              </div>
              <div className="flex justify-between text-base">
                <span className="text-gray-700">VAT (15%)</span>
                <span className="font-semibold text-black">
                  {formatCurrency(displayPayment.vat)}
                </span>
              </div>
              <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
                <span className="text-lg font-bold text-black">
                  {isActive ? 'Total to Pay' : 'Total Paid'}
                </span>
                <span className="text-2xl font-bold text-red-600">
                  {formatCurrency(displayPayment.total)}
                </span>
              </div>
            </div>
          )}

          {isActive && (
            <p className="text-xs text-center text-gray-500">
              Charges update in real time. Pay when you leave.
            </p>
          )}

          {(isCompleted || isCancelled) && (
            <Link
              href="/user"
              className="block w-full rounded-2xl bg-red-600 px-6 py-4 text-center text-lg font-bold text-white shadow-lg shadow-red-600/20 hover:bg-red-700 transition-colors"
            >
              Start New Parking
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <StatusBar />
        <p className="text-gray-600">Loading...</p>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
