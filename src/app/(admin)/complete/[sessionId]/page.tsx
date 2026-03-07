'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import StatusBar from '@/components/ui/StatusBar';
import Card from '@/components/ui/Card';
import { useSessionById, useCompleteSessionWithFinalValues } from '@/hooks';
import { calculatePayment, formatDuration } from '@/utils/parking';

export default function CompleteSessionPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params?.sessionId as string | undefined;

  const { data: session, isLoading, error } = useSessionById(sessionId ?? null);
  const completeWithFinalValues = useCompleteSessionWithFinalValues();

  const [elapsedMinutes, setElapsedMinutes] = useState(0);

  useEffect(() => {
    if (!session?.startTime || session.status !== 'active') return;
    const tick = () => {
      const mins = Math.max(
        0,
        Math.floor((Date.now() - session.startTime.getTime()) / 60000)
      );
      setElapsedMinutes(mins);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [session]);

  const payment =
    session?.status === 'active'
      ? calculatePayment(elapsedMinutes, session.zone.hourlyRate)
      : session
        ? { parkingFee: session.parkingFee, vat: session.vat, total: session.total }
        : null;

  const endTime = session ? new Date(session.startTime.getTime() + elapsedMinutes * 60000) : null;

  const handleComplete = async () => {
    if (!session || session.status !== 'active') return;
    try {
      await completeWithFinalValues.mutateAsync({
        id: session.id,
        endTime: new Date(),
        duration: elapsedMinutes,
        parkingFee: payment!.parkingFee,
        vat: payment!.vat,
        total: payment!.total,
      });
      router.push('/history');
    } catch (err: unknown) {
      alert(`Failed to complete: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  if (!sessionId) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <StatusBar />
        <div className="text-center">
          <p className="text-red-600">Invalid session.</p>
          <Link href="/history" className="mt-4 inline-block text-red-600 hover:underline">
            Back to History
          </Link>
        </div>
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

  if (error || !session) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <StatusBar />
        <div className="text-center">
          <p className="text-red-600">Session not found.</p>
          <Link href="/history" className="mt-4 inline-block text-red-600 hover:underline">
            Back to History
          </Link>
        </div>
      </div>
    );
  }

  if (session.status !== 'active') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <StatusBar />
        <div className="text-center">
          <p className="text-gray-600">This session is already {session.status}.</p>
          <Link href="/history" className="mt-4 inline-block text-red-600 hover:underline">
            Back to History
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <StatusBar />
      <div className="mx-auto max-w-md space-y-4">
        <div className="flex items-center gap-2">
          <Link
            href="/history"
            className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to History
          </Link>
        </div>

        <h1 className="text-2xl font-bold text-gray-900">Complete Parking Session</h1>
        <p className="text-gray-600">Review the details and confirm to complete this session.</p>

        {/* Session info */}
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-black">Session Details</h2>
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
              Active
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Zone</span>
              <span className="font-semibold text-black">{session.zone.code}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Plate Number</span>
              <span className="font-semibold text-black">{session.vehicle.plateNumber}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Phone</span>
              <span className="font-semibold text-black">{session.vehicle.phoneNumber}</span>
            </div>
          </div>
        </Card>

        {/* Time used */}
        <Card>
          <div className="mb-3 flex items-center gap-2">
            <svg className="h-6 w-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-base font-semibold text-black">Time Used</h2>
          </div>
          <div className="space-y-2">
            <div>
              <p className="text-xs text-gray-500">Start Time</p>
              <p className="text-base font-bold text-black">
                {session.startTime.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true,
                })}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">End Time (now)</p>
              <p className="text-base font-bold text-black">
                {endTime?.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true,
                })}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Duration</p>
              <p className="text-2xl font-bold text-black">{formatDuration(elapsedMinutes)}</p>
            </div>
          </div>
        </Card>

        {/* Fee to pay */}
        <Card>
          <div className="mb-3 flex items-center gap-2">
            <svg className="h-6 w-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h2 className="text-base font-semibold text-black">Fee to Pay</h2>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <p className="text-sm text-gray-700">Parking Fee</p>
              <p className="text-sm font-medium text-black">{payment?.parkingFee.toFixed(2)} ETB</p>
            </div>
            <div className="flex justify-between">
              <p className="text-sm text-gray-700">VAT (15%)</p>
              <p className="text-sm font-medium text-black">{payment?.vat.toFixed(2)} ETB</p>
            </div>
            <div className="mt-3 flex justify-between border-t border-gray-200 pt-3">
              <p className="text-lg font-bold text-black">Total to Pay</p>
              <p className="text-2xl font-bold text-red-600">{payment?.total.toFixed(2)} ETB</p>
            </div>
          </div>
        </Card>

        <div className="flex gap-3 pt-4">
          <Link
            href="/history"
            className="flex-1 rounded-2xl border border-gray-300 px-6 py-4 text-center font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            onClick={handleComplete}
            disabled={completeWithFinalValues.isPending}
            className="flex-1 rounded-2xl bg-red-600 px-6 py-4 font-bold text-white shadow-lg shadow-red-600/20 hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {completeWithFinalValues.isPending ? 'Completing...' : 'Confirm & Complete'}
          </button>
        </div>
      </div>
    </div>
  );
}
