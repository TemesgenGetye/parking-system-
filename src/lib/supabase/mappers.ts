import type { ParkingZone, Vehicle, ParkingSession } from '@/types/parking';
import type { ParkingZoneRow, ParkingSessionRow, ParkingSessionWithZoneRow } from './types';

export function mapZoneRowToZone(row: ParkingZoneRow): ParkingZone {
  return {
    id: row.id,
    name: row.name,
    code: row.code,
    hourlyRate: row.hourly_rate,
    available: row.available,
  };
}

export function mapZoneToRow(zone: Partial<ParkingZone>): Partial<ParkingZoneRow> {
  return {
    name: zone.name,
    code: zone.code,
    hourly_rate: zone.hourlyRate,
    available: zone.available,
  };
}

export function mapSessionRowToSession(
  row: ParkingSessionRow | ParkingSessionWithZoneRow,
  zone?: ParkingZone
): ParkingSession {
  let zoneData: ParkingZone;
  if (zone) {
    zoneData = zone;
  } else if ('zone_name' in row) {
    const r = row as ParkingSessionWithZoneRow;
    zoneData = {
      id: row.zone_id,
      name: r.zone_name,
      code: r.zone_code,
      hourlyRate: r.hourly_rate,
      available: true,
    };
  } else {
    zoneData = { id: row.zone_id, name: '', code: '', hourlyRate: 0, available: true };
  }

  return {
    id: row.id,
    zone: zoneData,
    vehicle: {
      phoneNumber: row.vehicle_phone ?? '',
      plateNumber: row.vehicle_plate ?? '',
      name: row.vehicle_name ?? undefined,
    },
    startTime: new Date(row.start_time),
    endTime: new Date(row.end_time),
    duration: row.duration,
    parkingFee: row.parking_fee,
    vat: row.vat,
    total: row.total,
    status: row.status,
    createdAt: new Date(row.created_at),
  };
}

export function mapSessionToRow(
  session: Omit<ParkingSession, 'id' | 'createdAt'>,
  source: 'admin' | 'user_portal' = 'user_portal'
): Omit<ParkingSessionRow, 'id' | 'created_at' | 'updated_at'> {
  return {
    zone_id: session.zone.id,
    vehicle_phone: session.vehicle.phoneNumber,
    vehicle_plate: session.vehicle.plateNumber,
    vehicle_name: session.vehicle.name ?? null,
    start_time: session.startTime.toISOString(),
    end_time: session.endTime.toISOString(),
    duration: session.duration,
    parking_fee: session.parkingFee,
    vat: session.vat,
    total: session.total,
    status: session.status,
    source,
  };
}
