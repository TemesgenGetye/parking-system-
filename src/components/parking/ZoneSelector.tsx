'use client';

import Card from '../ui/Card';
import { ParkingZone } from '@/types/parking';

interface ZoneSelectorProps {
  zones: ParkingZone[];
  selectedZone: ParkingZone | null;
  onSelect: (zone: ParkingZone) => void;
}

export default function ZoneSelector({ zones, selectedZone, onSelect }: ZoneSelectorProps) {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-black">Select Parking Zone</h2>
      <div className="grid grid-cols-2 gap-3">
        {zones.map((zone) => (
          <button
            key={zone.id}
            onClick={() => onSelect(zone)}
            className={`rounded-lg border-2 p-4 text-left transition-all ${
              selectedZone?.id === zone.id
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            } ${!zone.available ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={!zone.available}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Zone</p>
                <p className="text-lg font-bold text-black">{zone.code}</p>
                <p className="text-sm text-gray-600">{zone.name}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Rate</p>
                <p className="text-sm font-semibold text-black">{zone.hourlyRate} ETB/hr</p>
              </div>
            </div>
            {!zone.available && (
              <p className="mt-2 text-xs text-red-600">Unavailable</p>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
