import { FormEvent, useState } from 'react';

interface AuthFormProps {
  mode: 'login' | 'register';
  onSubmit: (email: string, password: string) => Promise<void> | void;
  error?: string;
}

export function AuthForm({ mode, onSubmit, error }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const isRegister = mode === 'register';

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      await onSubmit(email, password);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-md space-y-4 rounded-xl bg-white p-6 shadow">
      <h1 className="text-2xl font-bold">{isRegister ? 'Crear cuenta' : 'Iniciar sesión'}</h1>
      {error && <p role="alert" className="rounded bg-red-50 p-3 text-red-700">{error}</p>}
      <label className="block text-sm font-medium">Correo electrónico
        <input aria-label="Correo electrónico" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1 w-full rounded border p-2" />
      </label>
      <label className="block text-sm font-medium">Contraseña
        <input aria-label="Contraseña" type="password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1 w-full rounded border p-2" />
      </label>
      <button disabled={busy} className="w-full rounded bg-indigo-600 px-4 py-2 font-semibold text-white disabled:opacity-50">
        {busy ? 'Procesando…' : isRegister ? 'Registrar cuenta' : 'Iniciar sesión'}
      </button>
    </form>
  );
}
