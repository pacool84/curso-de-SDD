import type { Reservation } from '../services/apiClient';

export function ReservationList({ reservations, onCancel }: { reservations: Reservation[]; onCancel?: (id: number) => void }) {
  if (reservations.length === 0) return <p className="rounded bg-white p-4 text-slate-600">No hay reservas en esta sección.</p>;
  return <div className="space-y-3">{reservations.map((reservation) => <article key={reservation.id} className="rounded bg-white p-4 shadow-sm"><p className="font-semibold">{reservation.courtName}</p><p>{reservation.date} · {String(reservation.startHour).padStart(2, '0')}:00–{String(reservation.endHour).padStart(2, '0')}:00</p><p className="text-sm text-slate-600">Estado: {reservation.status === 'cancelled' ? 'Cancelada' : 'Activa'}</p>{onCancel && reservation.status === 'active' && <button type="button" onClick={() => onCancel(reservation.id)} className="mt-2 rounded border border-red-300 px-3 py-1 text-red-700">Cancelar reserva</button>}</article>)}</div>;
}
