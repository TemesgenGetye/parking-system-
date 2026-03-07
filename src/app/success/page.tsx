'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import StatusBar from '@/components/ui/StatusBar';
import { calculatePayment, formatDuration, formatCurrency } from '@/utils/parking';
import { useSessionById } from '@/hooks';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session');

  const { data: session, isLoading, error } = useSessionById(sessionId);
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

  if (!session && !isLoading) {
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

  return (
    <div className="min-h-screen bg-[#F8F9FB]">
      <StatusBar />
      <main className="mx-auto max-w-md px-4 pb-8 sm:px-6">
        <div className="pt-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-black">Parking Active</h1>
              <p className="text-sm text-gray-600">
                Zone {session.zone.code} · {session.zone.name}
              </p>
            </div>
          </div>

          <div className="rounded-2xl ring-2 ring-amber-200/50 bg-amber-50 p-6 text-center shadow-sm">
            <p className="text-sm font-medium text-gray-600 mb-1">Time Parked</p>
            <p className="text-4xl font-bold text-amber-700 tabular-nums">
              {formatDuration(elapsedMinutes)}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Rate: {session.zone.hourlyRate} ETB / hour
            </p>
          </div>

          <div className="rounded-2xl bg-white ring-1 ring-gray-200/50 p-6 space-y-4 shadow-sm">
            <p className="text-sm font-medium text-gray-600">Current Charges</p>
            <div className="flex justify-between text-base">
              <span className="text-gray-700">Parking fee</span>
              <span className="font-semibold text-black">
                {formatCurrency(currentPayment.parkingFee)}
              </span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-gray-700">VAT (15%)</span>
              <span className="font-semibold text-black">
                {formatCurrency(currentPayment.vat)}
              </span>
            </div>
            <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
              <span className="text-lg font-bold text-black">Total to Pay</span>
              <span className="text-2xl font-bold text-red-600">
                {formatCurrency(currentPayment.total)}
              </span>
            </div>
          </div>

          <p className="text-xs text-center text-gray-500">
            Charges update in real time. Pay when you leave.
          </p>
        </div>
      </main>
    </div>
  );
}
