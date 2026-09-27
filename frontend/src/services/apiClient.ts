export interface ApiErrorBody {
  code: string;
  message: string;
}

export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message);
  }
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options?.headers ?? {}) },
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => ({ code: 'UNKNOWN', message: 'Ocurrió un error inesperado.' }))) as ApiErrorBody;
    throw new ApiError(response.status, body.code, body.message);
  }
  return response.status === 204 ? (undefined as T) : response.json();
}

export const api = {
  register: (email: string, password: string) => request<{ user: { id: number; email: string } }>('/api/auth/register', { method: 'POST', body: JSON.stringify({ email, password }) }),
  login: (email: string, password: string) => request<{ user: { id: number; email: string } }>('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  logout: () => request<void>('/api/auth/logout', { method: 'POST' }),
  courts: () => request<{ courts: { id: number; name: string }[] }>('/api/courts'),
  availability: (courtId: number, date: string) => request<{ blocks: AvailabilityBlock[] }>(`/api/courts/${courtId}/availability?date=${date}`),
  createReservation: (input: { courtId: number; date: string; startHour: number }) => request<{ reservation: Reservation }>('/api/reservations', { method: 'POST', body: JSON.stringify(input) }),
  reservations: () => request<{ upcoming: Reservation[]; history: Reservation[] }>('/api/reservations'),
  cancelReservation: (id: number) => request<{ reservation: Reservation }>(`/api/reservations/${id}/cancel`, { method: 'POST' }),
};

export interface AvailabilityBlock {
  startHour: number;
  endHour: number;
  status: 'available' | 'reserved';
  reservable: boolean;
}

export interface Reservation {
  id: number;
  courtName: string;
  date: string;
  startHour: number;
  endHour: number;
  status: 'active' | 'cancelled';
}
