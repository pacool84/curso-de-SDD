import { fireEvent, render, screen } from '@testing-library/react';
import { AvailabilityGrid } from '../src/components/AvailabilityGrid';
import { DatePicker } from '../src/components/DatePicker';

describe('AvailabilityGrid', () => {
  it('shows 15 one-hour operating blocks with their status', () => {
    const blocks = Array.from({ length: 15 }, (_, index) => ({
      startHour: index + 7,
      endHour: index + 8,
      status: index + 7 === 14 ? 'reserved' : 'available',
      reservable: index + 7 !== 7,
    } as const));

    render(<AvailabilityGrid blocks={blocks} onSelect={vi.fn()} />);

    expect(screen.getAllByRole('button')).toHaveLength(15);
    expect(screen.getByRole('button', { name: /14:00.*Reservado/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /15:00.*Disponible/i })).toBeEnabled();
    expect(screen.queryByRole('button', { name: /06:00/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^22:00/i })).not.toBeInTheDocument();
  });
});

describe('DatePicker', () => {
  it('reports the selected date', () => {
    const onChange = vi.fn();
    render(<DatePicker date="2099-01-01" onChange={onChange} />);

    fireEvent.change(screen.getByLabelText('Fecha'), { target: { value: '2099-01-02' } });

    expect(onChange).toHaveBeenCalledWith('2099-01-02');
  });
});
