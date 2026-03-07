'use client';

import Card from '../ui/Card';
import { ParkingZone } from '@/types/parking';
import { getZoneBadgeClass } from '@/utils/zoneColors';

interface ZoneSelectorProps {
  zones: ParkingZone[];
  selectedZone: ParkingZone | null;
  onSelect: (zone: ParkingZone) => void;
  /** When true, only available zones are shown. Use for user portal. */
  onlyAvailable?: boolean;
}

export default function ZoneSelector({ zones, selectedZone, onSelect, onlyAvailable = false }: ZoneSelectorProps) {
  const displayZones = onlyAvailable ? zones.filter((z) => z.available) : zones;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900">Select Parking Zone</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2">
        {displayZones.map((zone) => (
          <button
            key={zone.id}
            onClick={() => onSelect(zone)}
            className={`rounded-2xl border-2 p-4 text-left transition-all ${
              selectedZone?.id === zone.id
                ? zone.available
                  ? 'border-green-600 bg-green-50'
                  : 'border-gray-400 bg-gray-50'
                : zone.available
                  ? 'border-gray-200 bg-white hover:border-green-300'
                  : 'border-gray-200 bg-gray-50'
            } 
            ${!onlyAvailable && !zone.available ? 'opacity-60 cursor-not-allowed' : ''}`}
            disabled={!onlyAvailable && !zone.available}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 shrink-0 rounded-full ${zone.available ? 'bg-green-500' : 'bg-gray-500'}`} aria-hidden />
                <div>
                  <p className="text-xs text-gray-500">Zone</p>
                  <p className="text-lg font-bold text-black">{zone.code}</p>
                  <p className="text-sm text-gray-600">{zone.name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Rate</p>
                <p className="text-sm font-semibold text-black">{zone.hourlyRate} ETB/hr</p>
                {!onlyAvailable && (
                  <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${getZoneBadgeClass(zone.available)}`}>
                    {zone.available ? 'Available' : 'Unavailable'}
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
