import type Database from 'better-sqlite3';
import { HttpError } from '../http/errors.js';
import type { AvailabilityBlock } from '../shared/types.js';

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

export function getAvailability(db: Database.Database, courtId: number, date: string): AvailabilityBlock[] {
  if (!Number.isInteger(courtId) || !datePattern.test(date)) {
    throw new HttpError(400, 'INVALID_AVAILABILITY', 'La cancha o la fecha no son válidas.');
  }
  const court = db.prepare('SELECT id FROM courts WHERE id = ?').get(courtId);
  if (!court) throw new HttpError(404, 'COURT_NOT_FOUND', 'La cancha seleccionada no existe.');
  const rows = db.prepare(`SELECT startHour FROM reservations WHERE courtId = ? AND date = ? AND status = 'active'`).all(courtId, date) as { startHour: number }[];
  const reservedHours = new Set(rows.map((row) => row.startHour));
  const today = new Date();
  const selectedDate = new Date(`${date}T00:00:00`);
  const isToday = selectedDate.toDateString() === today.toDateString();
  const isPastDate = selectedDate.getTime() < new Date(today.toDateString()).getTime();
  return Array.from({ length: 24 }, (_, startHour) => {
    const isPast = isPastDate || (isToday && startHour <= today.getHours());
    return {
      startHour,
      endHour: startHour + 1,
      status: reservedHours.has(startHour) ? 'reserved' : 'available',
      reservable: !isPast && !reservedHours.has(startHour),
    };
  });
}
