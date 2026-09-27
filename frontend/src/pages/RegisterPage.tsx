import { useState } from 'react';
import { AuthForm } from '../components/AuthForm';
import { ApiError } from '../services/apiClient';
import { useSession } from '../app/session';

export function RegisterPage({ onLogin }: { onLogin: () => void }) {
  const { authenticate } = useSession();
  const [error, setError] = useState('');
  async function submit(email: string, password: string) { try { await authenticate(email, password, 'register'); } catch (cause) { setError(cause instanceof ApiError ? cause.message : 'No fue posible crear la cuenta.'); } }
  return <div><AuthForm mode="register" onSubmit={submit} error={error} /><button type="button" onClick={onLogin} className="mx-auto mt-4 block text-indigo-700">Ya tengo una cuenta</button></div>;
}
