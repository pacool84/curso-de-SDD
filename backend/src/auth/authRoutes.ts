import { Router } from 'express';
import type Database from 'better-sqlite3';
import { login, logout, register } from './authService.js';
import { readCookie, SESSION_COOKIE, sessionCookie } from './sessionService.js';

export function authRoutes(db: Database.Database): Router {
  const router = Router();
  router.post('/register', (request, response) => {
    const result = register(db, request.body?.email, request.body?.password);
    response.setHeader('Set-Cookie', sessionCookie(result.token));
    response.status(201).json({ user: result.user });
  });
  router.post('/login', (request, response) => {
    const result = login(db, request.body?.email, request.body?.password);
    response.setHeader('Set-Cookie', sessionCookie(result.token));
    response.json({ user: result.user });
  });
  router.post('/logout', (request, response) => {
    logout(db, readCookie(request.headers.cookie, SESSION_COOKIE));
    response.setHeader('Set-Cookie', sessionCookie('', 0));
    response.status(204).send();
  });
  return router;
}
