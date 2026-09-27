import { useState } from 'react';
import { AuthForm } from '../components/AuthForm';
import { ApiError } from '../services/apiClient';
import { useSession } from '../app/session';

export function LoginPage({ onRegister }: { onRegister: () => void }) {
  const { authenticate } = useSession();
  const [error, setError] = useState('');
  async function submit(email: string, password: string) { try { await authenticate(email, password, 'login'); } catch (cause) { setError(cause instanceof ApiError ? cause.message : 'No fue posible iniciar sesión.'); } }
  return <div><AuthForm mode="login" onSubmit={submit} error={error} /><button type="button" onClick={onRegister} className="mx-auto mt-4 block text-indigo-700">Crear una cuenta</button></div>;
}
