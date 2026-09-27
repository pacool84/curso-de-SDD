import { render, screen } from '@testing-library/react';
import { AvailabilityGrid } from '../src/components/AvailabilityGrid';

describe('AvailabilityGrid', () => {
  it('shows 24 one-hour blocks with their status', () => {
    const blocks = Array.from({ length: 24 }, (_, startHour) => ({
      startHour,
      endHour: startHour + 1,
      status: startHour === 14 ? 'reserved' : 'available',
      reservable: startHour !== 0,
    } as const));

    render(<AvailabilityGrid blocks={blocks} onSelect={vi.fn()} />);

    expect(screen.getAllByRole('button')).toHaveLength(24);
    expect(screen.getByRole('button', { name: /14:00.*Reservado/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /15:00.*Disponible/i })).toBeEnabled();
  });
});
