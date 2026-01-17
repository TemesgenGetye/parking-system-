import Card from '../ui/Card';

interface DurationCardProps {
  startTime: Date;
  endTime: Date;
  duration: number; // in minutes
}

export default function DurationCard({ startTime, endTime, duration }: DurationCardProps) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours} Hours ${mins} Min`;
  };

  return (
    <Card>
      <div className="mb-3 flex items-center gap-2">
        <svg className="h-6 w-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 className="text-base font-semibold text-black">Duration</h2>
      </div>
      <div className="space-y-3">
        <div>
          <p className="text-xs text-gray-500">Start Time</p>
          <p className="text-base font-bold text-black">{formatDate(startTime)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">End Time</p>
          <p className="text-base font-bold text-black">{formatDate(endTime)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Duration</p>
          <p className="text-base font-bold text-black">{formatDuration(duration)}</p>
        </div>
      </div>
    </Card>
  );
}
