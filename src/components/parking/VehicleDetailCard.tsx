'use client';

import Card from '../ui/Card';
import { Vehicle } from '@/types/parking';

interface VehicleDetailCardProps {
  vehicle: Vehicle;
  onEdit?: () => void;
}

export default function VehicleDetailCard({ vehicle, onEdit }: VehicleDetailCardProps) {
  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="h-6 w-6 text-black" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
          </svg>
          <h2 className="text-base font-semibold text-black">Vehicle Detail</h2>
        </div>
        {onEdit && (
          <button onClick={onEdit} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        )}
      </div>
      <div className="space-y-3">
        <div>
          <p className="text-xs text-gray-500">Phone Number</p>
          <p className="text-base font-bold text-black">{vehicle.phoneNumber}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Plate Number</p>
          <p className="text-base font-bold text-black">{vehicle.plateNumber}</p>
        </div>
      </div>
    </Card>
  );
}
