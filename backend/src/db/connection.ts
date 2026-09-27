import Database from 'better-sqlite3';

export const COURTS = [
  'Cancha Laureles',
  'Cancha El Poblado',
  'Cancha Belén',
  'Cancha Robledo',
  'Cancha Envigado',
] as const;

export function initializeDatabase(db: Database.Database): void {
  db.pragma('foreign_keys = ON');
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      passwordHash TEXT NOT NULL,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      tokenHash TEXT NOT NULL UNIQUE,
      expiresAt TEXT NOT NULL,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      revokedAt TEXT
    );

    CREATE TABLE IF NOT EXISTS courts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS reservations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL REFERENCES users(id),
      courtId INTEGER NOT NULL REFERENCES courts(id),
      date TEXT NOT NULL,
      startHour INTEGER NOT NULL CHECK (startHour BETWEEN 0 AND 23),
      status TEXT NOT NULL CHECK (status IN ('active', 'cancelled')),
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      cancelledAt TEXT
    );

    CREATE UNIQUE INDEX IF NOT EXISTS active_court_slot
      ON reservations(courtId, date, startHour) WHERE status = 'active';
  `);

  const insertCourt = db.prepare('INSERT OR IGNORE INTO courts (name) VALUES (?)');
  const seed = db.transaction(() => {
    for (const court of COURTS) insertCourt.run(court);
  });
  seed();
}

export function openDatabase(path: string): Database.Database {
  const db = new Database(path);
  initializeDatabase(db);
  return db;
}
