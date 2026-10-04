import type Database from 'better-sqlite3';
import { HttpError, isSqliteConstraint } from '../http/errors.js';
import type { Reservation } from '../shared/types.js';

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

function blockDate(date: string, startHour: number): Date {
  if (!datePattern.test(date) || !Number.isInteger(startHour) || startHour < 7 || startHour > 21) {
    throw new HttpError(400, 'INVALID_BLOCK', 'Selecciona una fecha y un bloque de una hora válidos.');
  }
  const value = new Date(`${date}T${String(startHour).padStart(2, '0')}:00:00`);
  if (Number.isNaN(value.getTime()) || value.toISOString().slice(0, 10) !== date) {
    throw new HttpError(400, 'INVALID_BLOCK', 'Selecciona una fecha y un bloque de una hora válidos.');
  }
  return value;
}

function mapReservation(row: Record<string, unknown>): Reservation {
  return {
    id: Number(row.id),
    userId: Number(row.userId),
    courtId: Number(row.courtId),
    courtName: String(row.courtName),
    date: String(row.date),
    startHour: Number(row.startHour),
    endHour: Number(row.startHour) + 1,
    status: row.status as Reservation['status'],
    createdAt: String(row.createdAt),
    cancelledAt: row.cancelledAt as string | null,
  };
}

export function createReservation(db: Database.Database, userId: number, input: { courtId: unknown; date: unknown; startHour: unknown }) {
  if (!Number.isInteger(input.courtId) || typeof input.date !== 'string' || !Number.isInteger(input.startHour)) {
    throw new HttpError(400, 'INVALID_RESERVATION', 'Los datos de la reserva no son válidos.');
  }
  const courtId = Number(input.courtId);
  const date = input.date;
  const startHour = Number(input.startHour);
  const start = blockDate(date, startHour);
  if (start <= new Date()) {
    throw new HttpError(400, 'PAST_BLOCK', 'No puedes reservar una fecha u hora pasada.');
  }
  if (!db.prepare('SELECT id FROM courts WHERE id = ?').get(courtId)) {
    throw new HttpError(400, 'INVALID_COURT', 'La cancha seleccionada no es válida.');
  }

  const transaction = db.transaction(() => {
    const existing = db.prepare(`SELECT id, date, startHour FROM reservations WHERE userId = ? AND status = 'active'`).all(userId) as { id: number; date: string; startHour: number }[];
    if (existing.some((row) => blockDate(row.date, row.startHour) > new Date())) {
      throw new HttpError(409, 'RESERVATION_CONFLICT', 'Solo puedes tener una reserva activa a la vez.');
    }
    const occupied = db.prepare(`SELECT id FROM reservations WHERE courtId = ? AND date = ? AND startHour = ? AND status = 'active'`).get(courtId, date, startHour);
    if (occupied) {
      throw new HttpError(409, 'RESERVATION_CONFLICT', 'La cancha ya fue reservada en este horario.');
    }
    try {
      const result = db.prepare(`INSERT INTO reservations (userId, courtId, date, startHour, status) VALUES (?, ?, ?, ?, 'active')`).run(userId, courtId, date, startHour);
      return Number(result.lastInsertRowid);
    } catch (error) {
      if (isSqliteConstraint(error)) throw new HttpError(409, 'RESERVATION_CONFLICT', 'La cancha ya fue reservada en este horario.');
      throw error;
    }
  });
  const id = transaction();
  return getReservationForUser(db, userId, id);
}

export function getReservationForUser(db: Database.Database, userId: number, id: number): Reservation {
  const row = db.prepare(`SELECT r.*, c.name AS courtName FROM reservations r JOIN courts c ON c.id = r.courtId WHERE r.id = ? AND r.userId = ?`).get(id, userId) as Record<string, unknown> | undefined;
  if (!row) throw new HttpError(404, 'RESERVATION_NOT_FOUND', 'La reserva no existe.');
  return mapReservation(row);
}

export function listReservations(db: Database.Database, userId: number) {
  const rows = db.prepare(`SELECT r.*, c.name AS courtName FROM reservations r JOIN courts c ON c.id = r.courtId WHERE r.userId = ? ORDER BY r.date, r.startHour`).all(userId) as Record<string, unknown>[];
  const now = new Date();
  const reservations = rows.map(mapReservation);
  return {
    upcoming: reservations.filter((reservation) => reservation.status === 'active' && blockDate(reservation.date, reservation.startHour) > now),
    history: reservations.filter((reservation) => reservation.status === 'cancelled' || blockDate(reservation.date, reservation.startHour) <= now),
  };
}

export function cancelReservation(db: Database.Database, userId: number, id: number): Reservation {
  const row = db.prepare(`SELECT r.*, c.name AS courtName FROM reservations r JOIN courts c ON c.id = r.courtId WHERE r.id = ? AND r.userId = ?`).get(id, userId) as Record<string, unknown> | undefined;
  if (!row) throw new HttpError(404, 'RESERVATION_NOT_FOUND', 'La reserva no existe.');
  if (row.status !== 'active' || blockDate(String(row.date), Number(row.startHour)) <= new Date()) {
    throw new HttpError(409, 'RESERVATION_NOT_ACTIVE', 'La reserva ya no se puede cancelar.');
  }
  db.prepare(`UPDATE reservations SET status = 'cancelled', cancelledAt = ? WHERE id = ? AND userId = ? AND status = 'active'`).run(new Date().toISOString(), id, userId);
  return getReservationForUser(db, userId, id);
}
