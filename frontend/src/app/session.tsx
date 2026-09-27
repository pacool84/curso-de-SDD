import { createContext, useContext, useState, type ReactNode } from 'react';
import { api } from '../services/apiClient';

interface SessionContextValue {
  user: { id: number; email: string } | null;
  authenticate: (email: string, password: string, mode: 'login' | 'register') => Promise<void>;
  logout: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionContextValue['user']>(null);
  async function authenticate(email: string, password: string, mode: 'login' | 'register') {
    const result = mode === 'register' ? await api.register(email, password) : await api.login(email, password);
    setUser(result.user);
  }
  async function logout() { await api.logout(); setUser(null); }
  return <SessionContext.Provider value={{ user, authenticate, logout }}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSession must be used inside SessionProvider');
  return context;
}
