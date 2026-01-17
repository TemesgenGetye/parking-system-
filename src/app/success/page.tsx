'use client';

import { useRouter } from 'next/navigation';
import StatusBar from '@/components/ui/StatusBar';
import Card from '@/components/ui/Card';

export default function SuccessPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white">
      <StatusBar />
      <main className="mx-auto max-w-md px-4 pb-8 ml-0">
        <div className="flex min-h-[60vh] flex-col items-center justify-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-12 w-12 text-green-600"
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
          <h1 className="mb-2 text-2xl font-bold text-black">Payment Successful!</h1>
          <p className="mb-8 text-center text-gray-600">
            Your parking session has been activated. You can view your parking history anytime.
          </p>

          <div className="w-full space-y-3">
            <button
              onClick={() => router.push('/')}
              className="w-full rounded-lg bg-blue-600 px-6 py-3 text-lg font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              Book Another Parking
            </button>
            <button
              onClick={() => router.push('/history')}
              className="w-full rounded-lg border border-gray-300 px-6 py-3 text-base font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              View History
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
