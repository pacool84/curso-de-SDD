import { render, screen } from '@testing-library/react';
import { ReservationList } from '../src/components/ReservationList';

describe('ReservationList', () => {
  it('shows ownership-safe reservation details and cancellation action', () => {
    render(<ReservationList reservations={[{ id: 1, courtName: 'Cancha Laureles', date: '2099-01-01', startHour: 14, endHour: 15, status: 'active' }]} onCancel={vi.fn()} />);
    expect(screen.getByText('Cancha Laureles')).toBeInTheDocument();
    expect(screen.getByText(/2099-01-01/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancelar reserva/i })).toBeInTheDocument();
  });
});
