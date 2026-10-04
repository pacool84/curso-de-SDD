import request from 'supertest';
import { createTestApp } from '../test-utils.js';

async function register(app: Parameters<typeof request>[0], email: string) {
  return request(app).post('/api/auth/register').send({ email, password: 'password123' });
}

describe('court availability', () => {
  it('lists exactly the five fixed courts', async () => {
    const { app } = await createTestApp();
    const response = await request(app).get('/api/courts');

    expect(response.status).toBe(200);
    expect(response.body.courts.map((court: { name: string }) => court.name)).toEqual([
      'Cancha Laureles',
      'Cancha El Poblado',
      'Cancha Belén',
      'Cancha Robledo',
      'Cancha Envigado',
    ]);
  });

  it('returns 15 operating-hour blocks and marks future blocks available', async () => {
    const { app } = await createTestApp();
    const session = await register(app, 'availability@example.com');
    const response = await request(app)
      .get('/api/courts/1/availability?date=2099-01-01')
      .set('Cookie', session.headers['set-cookie']);

    expect(response.status).toBe(200);
    expect(response.body.blocks).toHaveLength(15);
    expect(response.body.blocks[0]).toMatchObject({
      startHour: 7,
      endHour: 8,
      status: 'available',
      reservable: true,
    });
    expect(response.body.blocks[14]).toMatchObject({
      startHour: 21,
      endHour: 22,
      status: 'available',
      reservable: true,
    });
  });
});
