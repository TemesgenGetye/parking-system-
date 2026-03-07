'use client';

import { useState } from 'react';
import StatusBar from '@/components/ui/StatusBar';
import Card from '@/components/ui/Card';
import { ParkingZone } from '@/types/parking';
// @ts-ignore: optional dev dependency for QR rendering
import QRCode from 'react-qr-code';
import { useAvailableZones } from '@/hooks';

export default function QRGeneratorPage() {
  const { availableZones: availableZonesList = [], isLoading, error } = useAvailableZones();
  const [selectedZoneId, setSelectedZoneId] = useState<string>('');
  const availableZones = availableZonesList;

  const selectedZone = availableZones.find((z) => z.id === selectedZoneId) ?? availableZones[0];

  const getUserUrlForZone = (zone: ParkingZone) => {
    if (typeof window === 'undefined') return `/user?zone=${zone.id}`;
    return `${window.location.origin}/user?zone=${zone.id}`;
  };

  const handleCopyLink = async () => {
    if (!selectedZone) return;
    try {
      await navigator.clipboard.writeText(getUserUrlForZone(selectedZone));
      alert('Link copied to clipboard');
    } catch {
      alert('Unable to copy link');
    }
  };

  const handlePrint = () => window.print();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading zones...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-red-600">Failed to load zones. Check your Supabase connection.</p>
      </div>
    );
  }

  return (
    <div>
      <StatusBar />
      <div className="mx-auto max-w-4xl print:max-w-none print:mx-0">
          <div className="mb-6 flex flex-col gap-4 print:hidden sm:flex-row sm:items-center sm:justify-between">
            <div>
           
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 print:block">
            <div className="md:col-span-1 print:hidden">
              <Card>
                <h2 className="mb-4 text-lg font-semibold text-black">Select Zone</h2>
                <div className="space-y-2">
                  {availableZones.length === 0 ? (
                    <p className="text-gray-500 text-sm">No available zones. Enable a zone first.</p>
                  ) : (
                    availableZones.map((zone) => (
                      <button
                        key={zone.id}
                        onClick={() => setSelectedZoneId(zone.id)}
                        className={`w-full rounded-lg border p-3 text-left transition-colors ${
                          (selectedZoneId || availableZones[0]?.id) === zone.id
                            ? 'border-green-600 bg-green-50'
                            : 'border-gray-200 hover:bg-gray-50 hover:border-green-200'
                        }`}
                      >
                        <div className="flex justify-between items-center gap-2">
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 shrink-0 rounded-full bg-green-500" aria-hidden />
                            <span className="font-medium text-black">{zone.name}</span>
                          </div>
                          <span className="text-xs font-mono bg-green-100 px-2 py-1 rounded text-green-800">
                            {zone.code}
                          </span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </Card>
            </div>

            <div className="md:col-span-2 print:w-full">
              <Card className="flex flex-col items-center justify-center py-12 text-center print:shadow-none print:border-none">
                {selectedZone ? (
                  <div className="space-y-6 max-w-sm mx-auto">
                    <div className="text-center space-y-2">
                      <h2 className="text-2xl font-bold text-black">Scan to Park</h2>
                      <p className="text-gray-600">
                        Zone: <span className="font-bold text-black text-xl">{selectedZone.code}</span>
                      </p>
                      <p className="text-gray-500">{selectedZone.name}</p>
                    </div>

                    <div className="bg-white p-4 rounded-xl border-2 border-gray-100 shadow-sm inline-block print:border-none print:shadow-none">
                      <QRCode value={getUserUrlForZone(selectedZone)} size={256} />
                    </div>

                    <div className="space-y-4 print:hidden">
                      <p className="text-sm text-gray-500">
                        Scan this QR code to open the parking portal for this zone.
                      </p>
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={handleCopyLink}
                          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          Copy Link
                        </button>
                        <a
                          href={getUserUrlForZone(selectedZone)}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
                        >
                          Open Link
                        </a>
                      </div>
                    </div>

                    <div className="hidden print:block mt-8 text-sm text-gray-500">
                      <p>Powered by Selam Parking System</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500">Select a zone to generate a QR code</p>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>

      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          main { margin-left: 0 !important; padding: 0 !important; }
          .print\\:block, .print\\:block * { visibility: visible; }
          .print\\:hidden { display: none !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          .print\\:border-none { border: none !important; }
          .print\\:w-full { width: 100% !important; }
        }
      `}</style>
    </div>  </div>
  );
}
