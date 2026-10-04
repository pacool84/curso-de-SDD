import request from 'supertest';
import { createTestApp } from '../test-utils.js';

async function register(app: Parameters<typeof request>[0], email: string) {
  return request(app).post('/api/auth/register').send({ email, password: 'password123' });
}

describe('reservations', () => {
  it('creates one reservation and prevents a second active reservation', async () => {
    const { app } = await createTestApp();
    const session = await register(app, 'reservation@example.com');
    const cookie = session.headers['set-cookie'];
    const reservation = { courtId: 1, date: '2099-01-01', startHour: 14 };

    const first = await request(app).post('/api/reservations').set('Cookie', cookie).send(reservation);
    const second = await request(app).post('/api/reservations').set('Cookie', cookie).send({ ...reservation, startHour: 15 });

    expect(first.status).toBe(201);
    expect(second.status).toBe(409);
    expect(second.body.code).toBe('RESERVATION_CONFLICT');
  });

  it('enforces one active future reservation per user at the database level', async () => {
    const { app, db } = await createTestApp();
    const session = await register(app, 'database-constraint@example.com');
    const userId = session.body.user.id as number;
    const first = await request(app).post('/api/reservations').set('Cookie', session.headers['set-cookie']).send({
      courtId: 1,
      date: '2099-01-01',
      startHour: 14,
    });

    expect(first.status).toBe(201);
    expect(() => db.prepare(`
      INSERT INTO reservations (userId, courtId, date, startHour, status)
      VALUES (?, ?, ?, ?, 'active')
    `).run(userId, 2, '2099-01-02', 15)).toThrow();
  });

  it('rejects a colliding reservation from another user', async () => {
    const { app } = await createTestApp();
    const firstSession = await register(app, 'first@example.com');
    const secondSession = await register(app, 'second@example.com');
    const reservation = { courtId: 1, date: '2099-01-01', startHour: 14 };

    await request(app).post('/api/reservations').set('Cookie', firstSession.headers['set-cookie']).send(reservation);
    const response = await request(app).post('/api/reservations').set('Cookie', secondSession.headers['set-cookie']).send(reservation);

    expect(response.status).toBe(409);
    expect(response.body.message).toBe('La cancha ya fue reservada en este horario.');
  });

  it('rejects reservations outside the operating window', async () => {
    const { app } = await createTestApp();
    const session = await register(app, 'operating-hours@example.com');
    const cookie = session.headers['set-cookie'];

    const beforeOpening = await request(app).post('/api/reservations').set('Cookie', cookie).send({
      courtId: 1,
      date: '2099-01-01',
      startHour: 6,
    });
    const afterClosing = await request(app).post('/api/reservations').set('Cookie', cookie).send({
      courtId: 1,
      date: '2099-01-01',
      startHour: 22,
    });

    expect(beforeOpening.status).toBe(400);
    expect(afterClosing.status).toBe(400);
  });

  it('cancels an owned future reservation and keeps it in history', async () => {
    const { app } = await createTestApp();
    const session = await register(app, 'cancel@example.com');
    const cookie = session.headers['set-cookie'];
    const created = await request(app).post('/api/reservations').set('Cookie', cookie).send({ courtId: 1, date: '2099-01-01', startHour: 14 });

    const cancelled = await request(app).post(`/api/reservations/${created.body.reservation.id}/cancel`).set('Cookie', cookie);
    const list = await request(app).get('/api/reservations').set('Cookie', cookie);

    expect(cancelled.status).toBe(200);
    expect(cancelled.body.reservation.status).toBe('cancelled');
    expect(list.body.history[0].status).toBe('cancelled');
  });
});
