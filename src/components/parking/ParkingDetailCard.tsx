import Card from '../ui/Card';

interface ParkingDetailCardProps {
  zoneCode: string;
}

export default function ParkingDetailCard({ zoneCode }: ParkingDetailCardProps) {
  return (
    <Card>
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded bg-black text-xs font-bold text-white">
          P
        </div>
        <h2 className="text-base font-semibold text-black">Parking Detail</h2>
      </div>
      <div>
        <p className="text-xs text-gray-500">Parking Zone</p>
        <p className="text-base font-bold text-black">{zoneCode}</p>
      </div>
    </Card>
  );
}
