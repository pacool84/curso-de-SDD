import type { RequestHandler } from 'express';
import type Database from 'better-sqlite3';
import { findUserBySession, readCookie, SESSION_COOKIE } from '../auth/sessionService.js';
import { HttpError } from './errors.js';

export function requireSession(db: Database.Database): RequestHandler {
  return (request, _response, next) => {
    const token = readCookie(request.headers.cookie, SESSION_COOKIE);
    const user = findUserBySession(db, token);
    if (!user) {
      next(new HttpError(401, 'UNAUTHENTICATED', 'Debes iniciar sesión para continuar.'));
      return;
    }
    request.user = user;
    next();
  };
}
