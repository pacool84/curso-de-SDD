import request from 'supertest';
import { createTestApp } from '../test-utils.js';

describe('courts API contract', () => {
  it('returns the closed catalog shape', async () => {
    const { app } = await createTestApp();
    const response = await request(app).get('/api/courts');
    expect(response.status).toBe(200);
    expect(response.body.courts[0]).toEqual({ id: 1, name: 'Cancha Laureles' });
  });
});
