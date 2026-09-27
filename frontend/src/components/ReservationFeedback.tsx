export function ReservationFeedback({ message, error }: { message?: string; error?: string }) {
  if (!message && !error) return null;
  return <p role="status" className={`rounded p-3 ${error ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>{error ?? message}</p>;
}
