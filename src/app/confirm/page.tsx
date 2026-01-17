'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import StatusBar from '@/components/ui/StatusBar';
import ErrorBanner from '@/components/ui/ErrorBanner';
import ParkingDetailCard from '@/components/parking/ParkingDetailCard';
import VehicleDetailCard from '@/components/parking/VehicleDetailCard';
import DurationCard from '@/components/parking/DurationCard';
import PaymentDetailCard from '@/components/parking/PaymentDetailCard';
import { ParkingZone, Vehicle, ParkingSession } from '@/types/parking';
import { calculatePayment } from '@/utils/parking';

export default function ConfirmPage() {
  const router = useRouter();
  const [selectedZone, setSelectedZone] = useState<ParkingZone | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [startTime, setStartTime] = useState<Date>(new Date());
  const [duration, setDuration] = useState(30); // 30 minutes default
  const [showError, setShowError] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Load data from sessionStorage
    const zoneData = sessionStorage.getItem('selectedZone');
    const vehicleData = sessionStorage.getItem('vehicle');

    if (zoneData) {
      setSelectedZone(JSON.parse(zoneData));
    }
    if (vehicleData) {
      setVehicle(JSON.parse(vehicleData));
    }

    if (!zoneData || !vehicleData) {
      router.push('/');
    }
  }, [router]);

  const endTime = new Date(startTime.getTime() + duration * 60000);
  const payment = selectedZone
    ? calculatePayment(duration, selectedZone.hourlyRate)
    : { parkingFee: 0, vat: 0, total: 0 };

  const handleConfirm = async () => {
    if (!selectedZone || !vehicle) return;

    setIsProcessing(true);
    setShowError(false);

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Create parking session
    const session: ParkingSession = {
      id: Date.now().toString(),
      zone: selectedZone,
      vehicle,
      startTime,
      endTime,
      duration,
      parkingFee: payment.parkingFee,
      vat: payment.vat,
      total: payment.total,
      status: 'active',
      createdAt: new Date(),
    };

    // Save to localStorage (in a real app, this would be an API call)
    const sessions = JSON.parse(localStorage.getItem('parkingSessions') || '[]');
    sessions.push(session);
    localStorage.setItem('parkingSessions', JSON.stringify(sessions));

    // Clear session storage
    sessionStorage.removeItem('selectedZone');
    sessionStorage.removeItem('vehicle');

    setIsProcessing(false);
    router.push('/success');
  };

  const handleEditVehicle = () => {
    router.push('/');
  };

  const validatePhoneNumber = (phone: string) => {
    // Simple validation - check if it starts with +251 and has correct length
    return phone.startsWith('+251') && phone.length >= 13;
  };

  const handlePay = () => {
    if (!vehicle || !validatePhoneNumber(vehicle.phoneNumber)) {
      setShowError(true);
      return;
    }
    handleConfirm();
  };

  if (!selectedZone || !vehicle) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <StatusBar />
      <main className="mx-auto max-w-md px-4 pb-24 ml-0">
        <h1 className="mb-6 pt-4 text-2xl font-bold text-black">Confirm & Pay</h1>

        <div className="space-y-4">
          <ParkingDetailCard zoneCode={selectedZone.code} />
          <VehicleDetailCard vehicle={vehicle} onEdit={handleEditVehicle} />
          <DurationCard startTime={startTime} endTime={endTime} duration={duration} />
          <PaymentDetailCard payment={payment} />

          <div className="pt-4">
            <button
              onClick={handlePay}
              disabled={isProcessing}
              className="w-full rounded-lg bg-blue-600 px-6 py-3 text-lg font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Processing...' : 'Pay Now'}
            </button>
          </div>
        </div>
      </main>

      {showError && (
        <ErrorBanner
          message="Please make sure your phone number is correct and you have sufficient balance"
          onClose={() => setShowError(false)}
        />
      )}
    </div>
  );
}
