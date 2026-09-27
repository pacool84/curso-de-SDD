import { render, screen } from '@testing-library/react';
import { AuthForm } from '../src/components/AuthForm';

describe('AuthForm', () => {
  it('renders email and password fields for registration', () => {
    render(<AuthForm mode="register" onSubmit={vi.fn()} />);

    expect(screen.getByLabelText(/correo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /registrar/i })).toBeInTheDocument();
  });
});
