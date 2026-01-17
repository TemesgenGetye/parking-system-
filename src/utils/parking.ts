import { PaymentDetails, ParkingZone } from '@/types/parking';

export function calculatePayment(duration: number, hourlyRate: number): PaymentDetails {
  const hours = duration / 60;
  const parkingFee = hours * hourlyRate;
  const vat = parkingFee * 0.15;
  const total = parkingFee + vat;

  return {
    parkingFee: Math.round(parkingFee * 100) / 100,
    vat: Math.round(vat * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) {
    return `${mins} Min`;
  }
  return `${hours} Hours ${mins} Min`;
}

export function formatCurrency(amount: number): string {
  return `${amount.toFixed(2)} ETB`;
}

export function getZones(): ParkingZone[] {
  if (typeof window === 'undefined') {
    return [];
  }
  const storedZones = localStorage.getItem('parkingZones');
  if (storedZones) {
    return JSON.parse(storedZones);
  }
  // Initialize with default zones if none exist
  const defaultZones: ParkingZone[] = [
    { id: '1', name: 'Downtown', code: 'LK0804', hourlyRate: 15, available: true },
    { id: '2', name: 'City Center', code: 'LK0805', hourlyRate: 20, available: true },
    { id: '3', name: 'Airport', code: 'LK0806', hourlyRate: 25, available: true },
    { id: '4', name: 'Mall', code: 'LK0807', hourlyRate: 18, available: false },
    { id: '5', name: 'Residential', code: 'LK0808', hourlyRate: 12, available: true },
  ];
  localStorage.setItem('parkingZones', JSON.stringify(defaultZones));
  return defaultZones;
}

export const DEFAULT_ZONES: ParkingZone[] = [
  { id: '1', name: 'Downtown', code: 'LK0804', hourlyRate: 15, available: true },
  { id: '2', name: 'City Center', code: 'LK0805', hourlyRate: 20, available: true },
  { id: '3', name: 'Airport', code: 'LK0806', hourlyRate: 25, available: true },
  { id: '4', name: 'Mall', code: 'LK0807', hourlyRate: 18, available: false },
  { id: '5', name: 'Residential', code: 'LK0808', hourlyRate: 12, available: true },
];
