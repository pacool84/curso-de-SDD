import { useEffect, useState } from 'react';
import { AvailabilityGrid } from '../components/AvailabilityGrid';
import { CourtList } from '../components/CourtList';
import { ReservationFeedback } from '../components/ReservationFeedback';
import { ReservationForm } from '../components/ReservationForm';
import { api, ApiError, type AvailabilityBlock } from '../services/apiClient';

export function AvailabilityPage() {
  const [courts, setCourts] = useState<{ id: number; name: string }[]>([]);
  const [courtId, setCourtId] = useState(1);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [blocks, setBlocks] = useState<AvailabilityBlock[]>([]);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  useEffect(() => { api.courts().then((result) => setCourts(result.courts)).catch(() => setError('No fue posible cargar las canchas.')); }, []);
  useEffect(() => { if (!courtId || !date) return; api.availability(courtId, date).then((result) => { setBlocks(result.blocks); setError(''); }).catch((cause) => setError(cause instanceof ApiError ? cause.message : 'No fue posible consultar la disponibilidad.')); }, [courtId, date]);
  const courtName = courts.find((court) => court.id === courtId)?.name ?? 'Cancha';
  async function confirm() { if (selectedHour === null) return; try { await api.createReservation({ courtId, date, startHour: selectedHour }); setMessage('Reserva creada correctamente.'); setSelectedHour(null); const result = await api.availability(courtId, date); setBlocks(result.blocks); } catch (cause) { setError(cause instanceof ApiError ? cause.message : 'No fue posible crear la reserva.'); } }
  return <section className="space-y-6"><div><h1 className="text-3xl font-bold">Disponibilidad</h1><p className="text-slate-600">Selecciona una cancha y una fecha.</p></div><CourtList courts={courts} selectedId={courtId} onSelect={setCourtId} /><label className="block font-medium">Fecha<input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="ml-3 rounded border p-2" /></label><ReservationFeedback message={message} error={error} />{selectedHour !== null && <ReservationForm courtName={courtName} date={date} startHour={selectedHour} onConfirm={confirm} onCancel={() => setSelectedHour(null)} />}<AvailabilityGrid blocks={blocks} onSelect={setSelectedHour} /></section>;
}
