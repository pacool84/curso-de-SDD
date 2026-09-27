interface CourtListProps {
  courts: { id: number; name: string }[];
  selectedId?: number;
  onSelect: (id: number) => void;
}

export function CourtList({ courts, selectedId, onSelect }: CourtListProps) {
  return <div className="grid gap-3 sm:grid-cols-5">{courts.map((court) => <button key={court.id} type="button" onClick={() => onSelect(court.id)} className={`rounded border p-3 text-sm ${selectedId === court.id ? 'border-indigo-600 bg-indigo-50' : 'bg-white'}`}>{court.name}</button>)}</div>;
}
