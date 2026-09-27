interface ReservationFormProps {
  courtName: string;
  date: string;
  startHour: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ReservationForm({ courtName, date, startHour, onConfirm, onCancel }: ReservationFormProps) {
  return <div className="rounded-lg border bg-white p-4 shadow-sm"><p>Reservar <strong>{courtName}</strong> el {date} a las {String(startHour).padStart(2, '0')}:00?</p><div className="mt-3 flex gap-2"><button type="button" onClick={onConfirm} className="rounded bg-indigo-600 px-3 py-2 text-white">Confirmar reserva</button><button type="button" onClick={onCancel} className="rounded border px-3 py-2">Cancelar</button></div></div>;
}
