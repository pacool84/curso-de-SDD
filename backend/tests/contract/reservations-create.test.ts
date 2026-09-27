import request from 'supertest';
import { createTestApp } from '../test-utils.js';

describe('reservation creation API contract', () => {
  it('requires an authenticated session', async () => {
    const { app } = await createTestApp();
    const response = await request(app).post('/api/reservations').send({ courtId: 1, date: '2099-01-01', startHour: 14 });
    expect(response.status).toBe(401);
    expect(response.body).toEqual({ code: 'UNAUTHENTICATED', message: 'Debes iniciar sesión para continuar.' });
  });
});
