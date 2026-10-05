import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';

describe('users API', () => {
  it('reports health', async () => {
    const response = await request(createApp()).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });

  it('returns the public profile of an existing user', async () => {
    const response = await request(createApp()).get('/api/users/1');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ id: '1', name: 'Maya Patel' });
  });
});
