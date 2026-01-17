"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import StatusBar from "@/components/ui/StatusBar";
import ZoneSelector from "@/components/parking/ZoneSelector";
import VehicleForm from "@/components/parking/VehicleForm";
import { ParkingZone, Vehicle } from "@/types/parking";
import { getZones } from "@/utils/parking";

export default function Home() {
  const router = useRouter();
  const [selectedZone, setSelectedZone] = useState<ParkingZone | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [zones, setZones] = useState<ParkingZone[]>([]);

  useEffect(() => {
    const loadZones = () => {
      setZones(getZones());
    };
    loadZones();

    // Poll for changes (since storage event doesn't fire in same tab)
    const interval = setInterval(loadZones, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleZoneSelect = (zone: ParkingZone) => {
    setSelectedZone(zone);
  };

  const handleVehicleSubmit = (vehicleData: Vehicle) => {
    setVehicle(vehicleData);
    setShowVehicleForm(false);
  };

  const handleContinue = () => {
    if (selectedZone && vehicle) {
      // Store in sessionStorage for the confirm page
      sessionStorage.setItem("selectedZone", JSON.stringify(selectedZone));
      sessionStorage.setItem("vehicle", JSON.stringify(vehicle));
      router.push("/confirm");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <StatusBar />
      <main className="mx-auto max-w-md px-4 pb-8 ml-0">
        <h1 className="mb-6 pt-4 text-2xl font-bold text-black">
          Book Parking
        </h1>

        <div className="space-y-6">
          <ZoneSelector
            zones={zones}
            selectedZone={selectedZone}
            onSelect={handleZoneSelect}
          />

          {vehicle && !showVehicleForm ? (
            <div className="rounded-lg border-2 border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-black">
                  Vehicle Information
                </h2>
                <button
                  onClick={() => setShowVehicleForm(true)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Edit
                </button>
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-gray-500">Phone Number</p>
                  <p className="text-sm font-semibold text-black">
                    {vehicle.phoneNumber}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Plate Number</p>
                  <p className="text-sm font-semibold text-black">
                    {vehicle.plateNumber}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <VehicleForm
              initialVehicle={vehicle || undefined}
              onSubmit={handleVehicleSubmit}
              onCancel={vehicle ? () => setShowVehicleForm(false) : undefined}
            />
          )}

          {selectedZone && vehicle && (
            <button
              onClick={handleContinue}
              className="w-full rounded-lg bg-blue-600 px-6 py-3 text-lg font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              Continue to Confirm
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
