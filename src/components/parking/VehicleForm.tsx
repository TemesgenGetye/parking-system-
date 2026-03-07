'use client';

import { useState, useEffect } from 'react';
import Card from '../ui/Card';
import { Vehicle } from '@/types/parking';

interface VehicleFormProps {
  initialVehicle?: Vehicle;
  onSubmit: (vehicle: Vehicle | null) => void;
  onCancel?: () => void;
}

export default function VehicleForm({ initialVehicle, onSubmit, onCancel }: VehicleFormProps) {
  const [phoneNumber, setPhoneNumber] = useState(initialVehicle?.phoneNumber || '');
  const [plateNumber, setPlateNumber] = useState(initialVehicle?.plateNumber || '');
  const [name, setName] = useState(initialVehicle?.name || '');

  const isFormMode = !!onCancel;

  // Only auto-submit when both fields are complete and valid (not on every keystroke)
  const isPhoneValid = /^09\d{8}$/.test(phoneNumber.trim());
  const isPlateValid = plateNumber.trim().length >= 5;

  useEffect(() => {
    if (!isFormMode) {
      if (isPhoneValid && isPlateValid) {
        onSubmit({ phoneNumber: phoneNumber.trim(), plateNumber: plateNumber.trim(), name: name?.trim() });
      } else {
        onSubmit(null);
      }
    }
  }, [phoneNumber, plateNumber, name, onSubmit, isFormMode, isPhoneValid, isPlateValid]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isPhoneValid && isPlateValid) {
      onSubmit({ phoneNumber: phoneNumber.trim(), plateNumber: plateNumber.trim(), name: name?.trim() });
    }
  };

  const fields = (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Full Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-black focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Phone Number <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="09XXXXXXXX"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-black focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Plate Number <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={plateNumber}
          onChange={(e) => setPlateNumber(e.target.value)}
          placeholder="e.g. A12345 (min 5 characters)"
          minLength={5}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-black focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
          required
        />
      </div>
    </>
  );

  if (isFormMode) {
    return (
      <Card>
        <h2 className="mb-4 text-lg font-semibold text-black">Vehicle Information</h2>
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {fields}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={!isPhoneValid || !isPlateValid}
              className="flex-1 rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </Card>
    );
  }

  return <div className="space-y-4">{fields}</div>;
}
