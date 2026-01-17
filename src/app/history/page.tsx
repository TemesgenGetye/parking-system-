'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import StatusBar from '@/components/ui/StatusBar';
import Card from '@/components/ui/Card';
import { ParkingSession } from '@/types/parking';

export default function HistoryPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<ParkingSession[]>([]);

  useEffect(() => {
    // Load sessions from localStorage
    const storedSessions = JSON.parse(localStorage.getItem('parkingSessions') || '[]');
    // Parse dates
    const parsedSessions = storedSessions.map((session: any) => ({
      ...session,
      startTime: new Date(session.startTime),
      endTime: new Date(session.endTime),
      createdAt: new Date(session.createdAt),
    }));
    // Sort by most recent first
    parsedSessions.sort((a: ParkingSession, b: ParkingSession) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    );
    setSessions(parsedSessions);
  }, []);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <StatusBar />
      <main className="mx-auto max-w-md px-4 pb-8 ml-0">
        <div className="mb-6 flex items-center justify-between pt-4">
          <h1 className="text-2xl font-bold text-black">Parking History</h1>
        </div>

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
            {sessions.map((session) => (
              <Card key={session.id}>
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Zone</p>
                    <p className="text-lg font-bold text-black">{session.zone.code}</p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusColor(
                      session.status
                    )}`}
                  >
                    {session.status}
                  </span>
                </div>

                <div className="mb-3 space-y-2 border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Plate Number:</span>
                    <span className="font-semibold text-black">{session.vehicle.plateNumber}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-semibold text-black">{session.vehicle.phoneNumber}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-semibold text-black">
                      {Math.floor(session.duration / 60)}h {session.duration % 60}m
                    </span>
                  </div>
                </div>

                <div className="space-y-1 border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Start:</span>
                    <span className="text-black">{formatDate(session.startTime)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">End:</span>
                    <span className="text-black">{formatDate(session.endTime)}</span>
                  </div>
                  <div className="mt-2 flex justify-between border-t border-gray-200 pt-2">
                    <span className="font-semibold text-black">Total:</span>
                    <span className="text-lg font-bold text-black">{session.total.toFixed(2)} ETB</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
