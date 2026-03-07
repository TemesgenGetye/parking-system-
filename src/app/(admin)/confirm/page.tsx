'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import StatusBar from '@/components/ui/StatusBar';
import ErrorBanner from '@/components/ui/ErrorBanner';
import ParkingDetailCard from '@/components/parking/ParkingDetailCard';
import VehicleDetailCard from '@/components/parking/VehicleDetailCard';
import DurationCard from '@/components/parking/DurationCard';
import PaymentDetailCard from '@/components/parking/PaymentDetailCard';
import { ParkingZone, Vehicle } from '@/types/parking';
import { calculatePayment } from '@/utils/parking';
import { useCreateSession } from '@/hooks';

export default function ConfirmPage() {
  const router = useRouter();
  const createSession = useCreateSession('admin');
  const [selectedZone, setSelectedZone] = useState<ParkingZone | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [startTime, setStartTime] = useState<Date>(new Date());
  const [duration, setDuration] = useState(30);
  const [showError, setShowError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const zoneData = sessionStorage.getItem('selectedZone');
    const vehicleData = sessionStorage.getItem('vehicle');

    if (zoneData) setSelectedZone(JSON.parse(zoneData));
    if (vehicleData) setVehicle(JSON.parse(vehicleData));
    if (!zoneData || !vehicleData) router.push('/');
  }, [router]);

  const endTime = new Date(startTime.getTime() + duration * 60000);
  const payment = selectedZone
    ? calculatePayment(duration, selectedZone.hourlyRate)
    : { parkingFee: 0, vat: 0, total: 0 };

  const handleConfirm = async () => {
    if (!selectedZone || !vehicle) return;
    if (isSubmitting) return;

    setShowError(false);
    setIsSubmitting(true);
    try {
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
      sessionStorage.removeItem('selectedZone');
      sessionStorage.removeItem('vehicle');
      router.push(`/success?session=${session.id}`);
    } catch (err) {
      setIsSubmitting(false);
      alert(err instanceof Error ? err.message : 'Failed to create session');
    }
  };

  const handleEditVehicle = () => router.push('/');

  const validatePhoneNumber = (phone: string) =>
    phone.startsWith('09') && phone.length === 10 && /^09\d{8}$/.test(phone);

  const validatePlateNumber = (plate: string) =>
    plate.trim().length >= 5;

  const handlePay = () => {
    if (!vehicle) {
      setShowError(true);
      return;
    }
    if (!validatePhoneNumber(vehicle.phoneNumber)) {
      setShowError(true);
      return;
    }
    if (!validatePlateNumber(vehicle.plateNumber)) {
      setShowError(true);
      return;
    }
    handleConfirm();
  };

  if (!selectedZone || !vehicle) return null;

  return (
    <>
      <div>
        <StatusBar />
        <div className="mx-auto max-w-md space-y-4">
            <ParkingDetailCard zoneCode={selectedZone.code} />
            <VehicleDetailCard vehicle={vehicle} onEdit={handleEditVehicle} />
            <DurationCard startTime={startTime} endTime={endTime} duration={duration} />
            <PaymentDetailCard payment={payment} />

            <div className="pt-4">
              <button
                onClick={handlePay}
                disabled={createSession.isPending || isSubmitting}
                className="w-full rounded-2xl bg-red-600 px-6 py-4 text-lg font-bold text-white shadow-lg shadow-red-600/20 hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createSession.isPending || isSubmitting ? 'Processing...' : 'Pay Now'}
              </button>
            </div>
        </div>
      </div>

      {showError && (
        <ErrorBanner
          message="Please check your details: Phone must be 09XXXXXXXX (10 digits), Plate number must be at least 5 characters."
          onClose={() => setShowError(false)}
        />
      )}
    </>
  );


  
}
