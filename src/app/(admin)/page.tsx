"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import StatusBar from "@/components/ui/StatusBar";
import ZoneSelector from "@/components/parking/ZoneSelector";
import VehicleForm from "@/components/parking/VehicleForm";
import Card from "@/components/ui/Card";
import { ParkingZone, Vehicle } from "@/types/parking";
import { useAvailableZones, useSessions, useUpdateSessionStatus } from "@/hooks";
import { calculatePayment, getDisplayDuration } from "@/utils/parking";

export default function Home() {
  const router = useRouter();
  const { zones = [], isLoading, error } = useAvailableZones();
  const { data: sessions = [] } = useSessions();
  const updateStatus = useUpdateSessionStatus();

  const activeSessions = sessions.filter((s) => s.status === "active");

  const handleCancelSession = async (sessionId: string) => {
    if (!confirm("Are you sure you want to cancel this session?")) return;
    try {
      await updateStatus.mutateAsync({ id: sessionId, status: "cancelled" });
    } catch (err: unknown) {
      alert(`Failed to cancel: ${err instanceof Error ? err.message : String(err)}`);
    }
  };
  const [selectedZone, setSelectedZone] = useState<ParkingZone | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [showVehicleForm, setShowVehicleForm] = useState(false);

  const handleZoneSelect = (zone: ParkingZone) => {
    setSelectedZone(zone);
  };

  const handleVehicleSubmit = (vehicleData: Vehicle | null) => {
    if (vehicleData) {
      setVehicle(vehicleData);
      setShowVehicleForm(false);
    }
  };

  const handleContinue = () => {
    if (selectedZone && vehicle) {
      sessionStorage.setItem("selectedZone", JSON.stringify(selectedZone));
      sessionStorage.setItem("vehicle", JSON.stringify(vehicle));
      router.push("/confirm");
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
        <p className="text-red-600">Failed to load zones. Check your Supabase connection.</p>
      </div>
    );
  }

  return (
    <div>
      <StatusBar />
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Card variant="accent">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-100">Total Zones</p>
                <p className="mt-1 text-3xl font-bold text-white">{zones.length}</p>
              </div>
              <div className="rounded-2xl bg-white/20 p-3">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Available</p>
                <p className="mt-1 text-3xl font-bold text-gray-900">{zones.filter(z => z.available).length}</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Active Sessions</p>
                <p className="mt-1 text-3xl font-bold text-gray-900">{activeSessions.length}</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Today</p>
                <p className="mt-1 text-3xl font-bold text-gray-900">{sessions.filter(s => {
                  const d = new Date(s.startTime);
                  const today = new Date();
                  return d.toDateString() === today.toDateString();
                }).length}</p>
              </div>
            </div>
          </Card>
        </div>

        {activeSessions.length > 0 && (
          <Card className="mb-6">
            <h2 className="mb-3 text-xl font-bold text-gray-900">Active Sessions</h2>
            <p className="mb-4 text-sm text-gray-600">Complete or cancel ongoing parking</p>
            <div className="space-y-3">
              {activeSessions.map((session) => {
                const mins = getDisplayDuration(session);
                const payment = calculatePayment(mins, session.zone.hourlyRate);
                return (
                  <div
                    key={session.id}
                    className="flex items-center justify-between rounded-2xl bg-gray-50 p-4 ring-1 ring-gray-200/50"
                  >
                    <div className="flex items-center gap-3">
                      <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                        Active
                      </span>
                      <div>
                        <p className="font-semibold text-black">
                        {session.zone.code} · {session.vehicle.plateNumber}
                      </p>
                      <p className="text-sm text-gray-600">
                        {Math.floor(mins / 60)}h {mins % 60}m · {payment.total.toFixed(2)} ETB
                      </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={`/complete/${session.id}`}
                        className="rounded bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
                      >
                        Complete
                      </Link>
                      <button
                        onClick={() => handleCancelSession(session.id)}
                        disabled={updateStatus.isPending}
                        className="rounded bg-red-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-900 disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        <div className="space-y-6">
          <Card>
            <ZoneSelector
              zones={zones}
              selectedZone={selectedZone}
              onSelect={handleZoneSelect}
              onlyAvailable
            />
          </Card>

          {vehicle && !showVehicleForm ? (
            <Card>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-black">
                  Vehicle Information
                </h2>
                <button
                  onClick={() => setShowVehicleForm(true)}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
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
            </Card>
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
              className="w-full rounded-2xl bg-red-600 px-6 py-4 text-lg font-bold text-white shadow-lg shadow-red-600/20 hover:bg-red-700 transition-colors"
            >
              Continue to Confirm
            </button>
          )}
        </div>
      </div>
    </div>
  
  );
}

