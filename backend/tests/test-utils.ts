import Database from 'better-sqlite3';
import { createApp } from '../src/server.js';
import { initializeDatabase } from '../src/db/connection.js';

export async function createTestApp() {
  const db = new Database(':memory:');
  initializeDatabase(db);
  const server = createApp(db).listen(0);
  await new Promise<void>((resolve) => server.once('listening', resolve));
  return { db, app: server };
}
