export interface ParkingZone {
  id: string;
  name: string;
  code: string;
  hourlyRate: number;
  available: boolean;
}

export interface Vehicle {
  phoneNumber: string;
  plateNumber: string;
  name?: string;
}

export interface ParkingSession {
  id: string;
  zone: ParkingZone;
  vehicle: Vehicle;
  startTime: Date;
  endTime: Date;
  duration: number; // in minutes
  parkingFee: number;
  vat: number;
  total: number;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: Date;
}

export interface PaymentDetails {
  parkingFee: number;
  vat: number;
  total: number;
}
