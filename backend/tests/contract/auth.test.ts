import request from 'supertest';
import { createTestApp } from '../test-utils.js';

describe('auth API contract', () => {
  it('returns the documented register response and session cookie', async () => {
    const { app } = await createTestApp();
    const response = await request(app).post('/api/auth/register').send({ email: 'contract@example.com', password: 'password123' });
    expect(response.status).toBe(201);
    expect(response.body).toEqual({ user: { id: 1, email: 'contract@example.com' } });
    expect(response.headers['set-cookie'][0]).toContain('padel_session=');
  });
});
