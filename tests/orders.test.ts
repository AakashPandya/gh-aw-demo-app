import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';

describe('orders API', () => {
  it('creates an order and retrieves it by ID', async () => {
    const app = createApp();
    const created = await request(app).post('/api/orders').send({ product: ' Laptop ', quantity: 2 });
    expect(created.status).toBe(201);
    expect(created.body).toEqual({ id: expect.any(String), product: 'Laptop', quantity: 2 });
    expect(created.headers.location).toBe(`/api/orders/${created.body.id}`);
    const fetched = await request(app).get(`/api/orders/${created.body.id}`);
    expect(fetched.status).toBe(200);
    expect(fetched.body).toEqual(created.body);
  });

  it('rejects blank products', async () => {
    const response = await request(createApp()).post('/api/orders').send({ product: ' ', quantity: 1 });
    expect(response.status).toBe(400);
  });

  it('rejects malformed JSON', async () => {
    const response = await request(createApp()).post('/api/orders').set('Content-Type', 'application/json').send('{');
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Invalid JSON body' });
  });

  it('returns 404 for an unknown order', async () => {
    const response = await request(createApp()).get('/api/orders/missing');
    expect(response.status).toBe(404);
  });

  it('isolates data between application instances', async () => {
    const created = await request(createApp()).post('/api/orders').send({ product: 'Mouse', quantity: 1 });
    const response = await request(createApp()).get(`/api/orders/${created.body.id}`);
    expect(response.status).toBe(404);
  });
});
