export function CancelReservationDialog({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return <div role="dialog" aria-label="Confirmar cancelación" className="rounded border border-red-200 bg-red-50 p-4"><p>¿Confirmas la cancelación de esta reserva?</p><div className="mt-3 flex gap-2"><button type="button" onClick={onConfirm} className="rounded bg-red-600 px-3 py-2 text-white">Sí, cancelar</button><button type="button" onClick={onCancel} className="rounded border px-3 py-2">Volver</button></div></div>;
}
