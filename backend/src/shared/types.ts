export type ReservationStatus = 'active' | 'cancelled';

export interface User {
  id: number;
  email: string;
}

export interface Court {
  id: number;
  name: string;
}

export interface Reservation {
  id: number;
  userId: number;
  courtId: number;
  courtName?: string;
  date: string;
  startHour: number;
  endHour: number;
  status: ReservationStatus;
  createdAt: string;
  cancelledAt?: string | null;
}

export interface AvailabilityBlock {
  startHour: number;
  endHour: number;
  status: 'available' | 'reserved';
  reservable: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
