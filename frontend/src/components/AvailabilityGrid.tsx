import type { AvailabilityBlock } from '../services/apiClient';

interface AvailabilityGridProps {
  blocks: AvailabilityBlock[];
  onSelect: (startHour: number) => void;
}

export function AvailabilityGrid({ blocks, onSelect }: AvailabilityGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {blocks.map((block) => {
        const label = `${String(block.startHour).padStart(2, '0')}:00–${String(block.endHour).padStart(2, '0')}:00 ${block.status === 'reserved' ? 'Reservado' : 'Disponible'}`;
        return (
          <button key={block.startHour} type="button" disabled={!block.reservable || block.status === 'reserved'} onClick={() => onSelect(block.startHour)} aria-label={label} className="rounded border p-3 text-left disabled:cursor-not-allowed disabled:bg-slate-100 enabled:border-indigo-200 enabled:bg-indigo-50">
            <span className="block font-semibold">{String(block.startHour).padStart(2, '0')}:00–{String(block.endHour).padStart(2, '0')}:00</span>
            <span className="text-sm">{block.status === 'reserved' ? 'Reservado' : block.reservable ? 'Disponible' : 'No disponible'}</span>
          </button>
        );
      })}
    </div>
  );
}
