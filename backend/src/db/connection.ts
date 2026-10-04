import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import Database from 'better-sqlite3';
import { courts } from '../../../db/seed.js';

const migrationPath = resolve(process.cwd(), '../db/migrations/001_initial.sql');
const migrationSql = readFileSync(migrationPath, 'utf8');

export function initializeDatabase(db: Database.Database): void {
  db.exec(migrationSql);

  const insertCourt = db.prepare('INSERT OR IGNORE INTO courts (name) VALUES (?)');
  const seed = db.transaction(() => {
    for (const court of courts) insertCourt.run(court);
  });
  seed();
}

export function openDatabase(path: string): Database.Database {
  const db = new Database(path);
  initializeDatabase(db);
  return db;
}
