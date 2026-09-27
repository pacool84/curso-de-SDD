import { useEffect, useState } from 'react';
import { CancelReservationDialog } from '../components/CancelReservationDialog';
import { ReservationFeedback } from '../components/ReservationFeedback';
import { ReservationList } from '../components/ReservationList';
import { api, ApiError, type Reservation } from '../services/apiClient';

export function MyReservationsPage() {
  const [upcoming, setUpcoming] = useState<Reservation[]>([]);
  const [history, setHistory] = useState<Reservation[]>([]);
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  async function load() { try { const result = await api.reservations(); setUpcoming(result.upcoming); setHistory(result.history); } catch (cause) { setError(cause instanceof ApiError ? cause.message : 'No fue posible cargar tus reservas.'); } }
  useEffect(() => { void load(); }, []);
  async function cancel() { if (pendingId === null) return; try { await api.cancelReservation(pendingId); setPendingId(null); setMessage('Reserva cancelada. Permanece en tu historial.'); await load(); } catch (cause) { setError(cause instanceof ApiError ? cause.message : 'No fue posible cancelar la reserva.'); } }
  return <section className="space-y-6"><h1 className="text-3xl font-bold">Mis reservas</h1><ReservationFeedback message={message} error={error} />{pendingId !== null && <CancelReservationDialog onConfirm={cancel} onCancel={() => setPendingId(null)} />}<div><h2 className="mb-3 text-xl font-semibold">Próximas</h2><ReservationList reservations={upcoming} onCancel={setPendingId} /></div><div><h2 className="mb-3 text-xl font-semibold">Historial</h2><ReservationList reservations={history} /></div></section>;
}
