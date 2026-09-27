import { useState } from 'react';
import { useSession } from './session';
import { AvailabilityPage } from '../pages/AvailabilityPage';
import { LoginPage } from '../pages/LoginPage';
import { MyReservationsPage } from '../pages/MyReservationsPage';
import { RegisterPage } from '../pages/RegisterPage';

export function AppRoutes() {
  const { user, logout } = useSession();
  const [page, setPage] = useState<'availability' | 'reservations' | 'login' | 'register'>('availability');
  if (!user) return page === 'register' ? <RegisterPage onLogin={() => setPage('login')} /> : <LoginPage onRegister={() => setPage('register')} />;
  return <><header className="mb-8 flex flex-wrap items-center justify-between gap-3"><p className="font-semibold">Hola, {user.email}</p><nav className="flex gap-2"><button type="button" onClick={() => setPage('availability')} className="rounded border px-3 py-1">Disponibilidad</button><button type="button" onClick={() => setPage('reservations')} className="rounded border px-3 py-1">Mis reservas</button><button type="button" onClick={() => void logout()} className="rounded border px-3 py-1">Cerrar sesión</button></nav></header>{page === 'availability' ? <AvailabilityPage /> : <MyReservationsPage />}</>;
}
