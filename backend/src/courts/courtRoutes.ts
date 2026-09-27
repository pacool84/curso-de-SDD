import { Router } from 'express';
import type Database from 'better-sqlite3';
import { requireSession } from '../http/authMiddleware.js';
import { getAvailability } from './availabilityService.js';
import { listCourts } from './courtService.js';

export function courtRoutes(db: Database.Database): Router {
  const router = Router();
  router.get('/', (_request, response) => response.json({ courts: listCourts(db) }));
  router.get('/:courtId/availability', requireSession(db), (request, response) => {
    const blocks = getAvailability(db, Number(request.params.courtId), String(request.query.date ?? ''));
    const court = db.prepare('SELECT id, name FROM courts WHERE id = ?').get(Number(request.params.courtId));
    response.json({ court, date: request.query.date, blocks });
  });
  return router;
}
