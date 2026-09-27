import type Database from 'better-sqlite3';
import type { Court } from '../shared/types.js';

export function listCourts(db: Database.Database): Court[] {
  return db.prepare('SELECT id, name FROM courts ORDER BY id').all() as Court[];
}
