'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import StatusBar from '@/components/ui/StatusBar';
import ZoneSelector from '@/components/parking/ZoneSelector';
import VehicleForm from '@/components/parking/VehicleForm';
import { ParkingZone, Vehicle } from '@/types/parking';
import { calculatePayment } from '@/utils/parking';
import { useAvailableZones, useCreateSession, useLogQrScan } from '@/hooks';

function UserPortalContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const zoneParam = searchParams.get('zone');

  const { zones, availableZones, isLoading, error } = useAvailableZones();
  const createSession = useCreateSession('user_portal');
  const logQrScan = useLogQrScan();

  const [selectedZone, setSelectedZone] = useState<ParkingZone | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (zoneParam && availableZones.length > 0) {
      const found = availableZones.find(
        (z) => z.id === zoneParam || z.code === zoneParam
      );
      if (found) {
        setSelectedZone(found);
        logQrScan.mutate(found.id);
      }
    }
  }, [zoneParam, availableZones]);

  const validatePhoneNumber = (phone: string) =>
    phone.startsWith('09') && phone.length === 10 && /^09\d{8}$/.test(phone);

  const validatePlateNumber = (plate: string) =>
    plate.trim().length >= 5;

  const handleStart = async () => {
    if (!selectedZone || !vehicle) return;
    if (isSubmitting) return;
    if (!validatePhoneNumber(vehicle.phoneNumber)) {
      alert('Please provide a valid phone number starting with 09 (e.g. 0912345678)');
      return;
    }
    if (!validatePlateNumber(vehicle.plateNumber)) {
      alert('Plate number must be at least 5 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      const startTime = new Date();
      // Session runs until admin cancels/completes - use placeholder values for DB
      const duration = 0;
      const endTime = new Date(startTime.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year placeholder
      const payment = calculatePayment(duration, selectedZone.hourlyRate);

      const session = await createSession.mutateAsync({
        zone: selectedZone,
        vehicle,
        startTime,
        endTime,
        duration,
        parkingFee: payment.parkingFee,
        vat: payment.vat,
        total: payment.total,
        status: 'active',
      });

      sessionStorage.setItem('lastVehicle', JSON.stringify(vehicle));
      router.push(`/success?session=${session.id}`);
    } catch (err) {
      setIsSubmitting(false);
      alert(err instanceof Error ? err.message : 'Failed to start parking');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-red-600">Failed to load zones. Check your connection.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FB]">
      <StatusBar />
      <main className="mx-auto max-w-md px-4 pb-24 sm:px-6">
        <h1 className="mb-6 pt-4 text-3xl font-bold text-gray-900 text-center">Parking Portal</h1>

        <div className="space-y-6">
          {selectedZone ? (
            <div className="rounded-2xl bg-green-50 ring-1 ring-green-200/50 p-5 text-center relative shadow-sm">
              <button
                onClick={() => setSelectedZone(null)}
                className="absolute top-2 right-2 text-xs text-green-700 underline"
              >
                Change
              </button>
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="h-2 w-2 rounded-full bg-green-500" aria-hidden />
                <p className="text-sm text-gray-600">You are parking in:</p>
              </div>
              <p className="text-2xl font-bold text-green-800">{selectedZone.code}</p>
              <p className="text-gray-700 font-medium">{selectedZone.name}</p>
              <p className="text-sm text-gray-500 mt-1">{selectedZone.hourlyRate} ETB / hour</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Select a Parking Zone:</p>
              <ZoneSelector
                zones={availableZones}
                selectedZone={selectedZone}
                onSelect={setSelectedZone}
                onlyAvailable
              />
            </div>
          )}

          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-black">Your Details</h2>
            <VehicleForm
              initialVehicle={vehicle ?? undefined}
              onSubmit={(v) => setVehicle(v)}
            />
          </div>

          <div className="pt-4">
            <button
              onClick={handleStart}
              disabled={createSession.isPending || isSubmitting || !selectedZone || !vehicle}
              className="w-full rounded-2xl bg-red-600 px-6 py-4 text-lg font-bold text-white shadow-lg shadow-red-600/20 hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createSession.isPending ? 'Starting Session...' : 'Confirm & Start Parking'}
            </button>
            <p className="text-xs text-center text-gray-500 mt-3">
              By clicking confirm, you accept the parking rates and terms.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function UserPortalPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <StatusBar />
        <p className="text-gray-600">Loading...</p>
      </div>
    }>
      <UserPortalContent />
    </Suspense>
  );
}
