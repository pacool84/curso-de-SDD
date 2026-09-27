import request from 'supertest';
import { createTestApp } from '../test-utils.js';

describe('reservation management API contract', () => {
  it('returns the documented empty reservation groups', async () => {
    const { app } = await createTestApp();
    const registered = await request(app).post('/api/auth/register').send({ email: 'manage@example.com', password: 'password123' });
    const response = await request(app).get('/api/reservations').set('Cookie', registered.headers['set-cookie']);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ upcoming: [], history: [] });
  });
});
