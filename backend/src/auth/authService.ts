import type Database from 'better-sqlite3';
import { hashPassword, verifyPassword } from './password.js';
import { createSession, revokeSession } from './sessionService.js';
import { HttpError, isSqliteConstraint } from '../http/errors.js';
import type { User } from '../shared/types.js';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateCredentials(email: unknown, password: unknown): { email: string; password: string } {
  if (typeof email !== 'string' || !emailPattern.test(email.trim().toLowerCase())) {
    throw new HttpError(400, 'INVALID_EMAIL', 'Ingresa un correo electrónico válido.');
  }
  if (typeof password !== 'string' || password.length < 8) {
    throw new HttpError(400, 'INVALID_PASSWORD', 'La contraseña debe tener al menos 8 caracteres.');
  }
  return { email, password };
}

export function register(db: Database.Database, email: unknown, password: unknown) {
  const credentials = validateCredentials(email, password);
  const normalizedEmail = credentials.email.trim().toLowerCase();
  try {
    const result = db.prepare('INSERT INTO users (email, passwordHash) VALUES (?, ?)').run(
      normalizedEmail,
      hashPassword(credentials.password),
    );
    const user: User = { id: Number(result.lastInsertRowid), email: normalizedEmail };
    return { user, token: createSession(db, user.id) };
  } catch (error) {
    if (isSqliteConstraint(error)) {
      throw new HttpError(409, 'EMAIL_EXISTS', 'El correo ya está registrado.');
    }
    throw error;
  }
}

export function login(db: Database.Database, email: unknown, password: unknown) {
  if (typeof email !== 'string' || typeof password !== 'string') {
    throw new HttpError(400, 'INVALID_CREDENTIALS', 'Completa tu correo y contraseña.');
  }
  const row = db.prepare('SELECT id, email, passwordHash FROM users WHERE email = ?').get(email.trim().toLowerCase()) as { id: number; email: string; passwordHash: string } | undefined;
  if (!row || !verifyPassword(password, row.passwordHash)) {
    throw new HttpError(401, 'INVALID_CREDENTIALS', 'El correo o la contraseña no son válidos.');
  }
  return { user: { id: row.id, email: row.email }, token: createSession(db, row.id) };
}

export function logout(db: Database.Database, token: string | undefined): void {
  if (!token) throw new HttpError(401, 'UNAUTHENTICATED', 'Debes iniciar sesión para continuar.');
  revokeSession(db, token);
}
