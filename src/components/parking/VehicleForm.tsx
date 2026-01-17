'use client';

import { useState } from 'react';
import Card from '../ui/Card';
import { Vehicle } from '@/types/parking';

interface VehicleFormProps {
  initialVehicle?: Vehicle;
  onSubmit: (vehicle: Vehicle) => void;
  onCancel?: () => void;
}

export default function VehicleForm({ initialVehicle, onSubmit, onCancel }: VehicleFormProps) {
  const [phoneNumber, setPhoneNumber] = useState(initialVehicle?.phoneNumber || '');
  const [plateNumber, setPlateNumber] = useState(initialVehicle?.plateNumber || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber && plateNumber) {
      onSubmit({ phoneNumber, plateNumber });
    }
  };

  return (
    <Card>
      <h2 className="mb-4 text-lg font-semibold text-black">Vehicle Information</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="+251900000000"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-black focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Plate Number
          </label>
          <input
            type="text"
            value={plateNumber}
            onChange={(e) => setPlateNumber(e.target.value)}
            placeholder="03-AA-C02823"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-black focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
            required
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            Save
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </Card>
  );
}
