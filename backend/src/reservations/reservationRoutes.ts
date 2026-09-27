import { Router } from 'express';
import type Database from 'better-sqlite3';
import { createReservation, cancelReservation, listReservations } from './reservationService.js';
import { requireSession } from '../http/authMiddleware.js';

export function reservationRoutes(db: Database.Database): Router {
  const router = Router();
  router.use(requireSession(db));
  router.post('/', (request, response) => {
    const reservation = createReservation(db, request.user!.id, request.body ?? {});
    response.status(201).json({ reservation });
  });
  router.get('/', (request, response) => response.json(listReservations(db, request.user!.id)));
  router.post('/:reservationId/cancel', (request, response) => {
    const reservation = cancelReservation(db, request.user!.id, Number(request.params.reservationId));
    response.json({ reservation });
  });
  return router;
}
