import express from 'express';
import type Database from 'better-sqlite3';
import { openDatabase } from './db/connection.js';
import { authRoutes } from './auth/authRoutes.js';
import { courtRoutes } from './courts/courtRoutes.js';
import { reservationRoutes } from './reservations/reservationRoutes.js';
import { errorHandler, notFound } from './http/errors.js';

export function createApp(db: Database.Database) {
  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRoutes(db));
  app.use('/api/courts', courtRoutes(db));
  app.use('/api/reservations', reservationRoutes(db));
  app.use(notFound);
  app.use(errorHandler);
  return app;
}

if (process.env.NODE_ENV !== 'test') {
  const port = Number(process.env.PORT ?? 3000);
  const databasePath = process.env.DATABASE_PATH ?? 'db/padel.db';
  createApp(openDatabase(databasePath)).listen(port, () => {
    console.log(`Padel reservations backend listening on port ${port}`);
  });
}
