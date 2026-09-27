import request from 'supertest';
import { createTestApp } from '../test-utils.js';

describe('authentication', () => {
  it('registers a user and starts a session', async () => {
    const { app } = await createTestApp();

    const response = await request(app).post('/api/auth/register').send({
      email: 'PLAYER@example.com',
      password: 'password123',
    });

    expect(response.status).toBe(201);
    expect(response.body.user.email).toBe('player@example.com');
    expect(response.headers['set-cookie']).toBeDefined();
  });

  it('rejects duplicate emails without exposing details', async () => {
    const { app } = await createTestApp();
    const user = { email: 'player@example.com', password: 'password123' };
    await request(app).post('/api/auth/register').send(user);

    const response = await request(app).post('/api/auth/register').send(user);

    expect(response.status).toBe(409);
    expect(response.body.message).toBe('El correo ya está registrado.');
    expect(response.body.stack).toBeUndefined();
  });

  it('protects availability without an active session', async () => {
    const { app } = await createTestApp();
    const response = await request(app).get('/api/courts/1/availability?date=2099-01-01');

    expect(response.status).toBe(401);
    expect(response.body.code).toBe('UNAUTHENTICATED');
  });
});
