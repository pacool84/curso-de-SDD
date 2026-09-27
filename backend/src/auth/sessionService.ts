import { createHash, randomBytes } from 'node:crypto';
import type Database from 'better-sqlite3';
import type { User } from '../shared/types.js';

export const SESSION_COOKIE = 'padel_session';

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function createSession(db: Database.Database, userId: number): string {
  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  db.prepare('INSERT INTO sessions (userId, tokenHash, expiresAt) VALUES (?, ?, ?)').run(
    userId,
    hashToken(token),
    expiresAt,
  );
  return token;
}

export function findUserBySession(db: Database.Database, token: string | undefined): User | null {
  if (!token) return null;
  const row = db.prepare(`
    SELECT users.id, users.email
    FROM sessions JOIN users ON users.id = sessions.userId
    WHERE sessions.tokenHash = ? AND sessions.revokedAt IS NULL AND sessions.expiresAt > ?
  `).get(hashToken(token), new Date().toISOString()) as User | undefined;
  return row ?? null;
}

export function revokeSession(db: Database.Database, token: string | undefined): void {
  if (!token) return;
  db.prepare('UPDATE sessions SET revokedAt = ? WHERE tokenHash = ?').run(
    new Date().toISOString(),
    hashToken(token),
  );
}

export function readCookie(header: string | undefined, name: string): string | undefined {
  return header?.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${name}=`))?.slice(name.length + 1);
}

export function sessionCookie(token: string, maxAge = 24 * 60 * 60): string {
  return `${SESSION_COOKIE}=${token}; HttpOnly; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
}
