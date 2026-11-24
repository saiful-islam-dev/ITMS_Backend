import request from 'supertest';
import { createApp } from '../src/app';

describe('Health Check API (GET /api/v1/health)', () => {
  const app = createApp();

  it('should return operational status and standard response envelope', async () => {
    const response = await request(app).get('/api/v1/health');

    expect(response.headers['content-type']).toMatch(/json/);
    expect(response.body).toHaveProperty('success');
    expect(response.body).toHaveProperty('statusCode');
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('data');
    expect(response.body).toHaveProperty('meta');
    expect(response.body.meta).toHaveProperty('timestamp');

    expect(response.body.data).toHaveProperty('services');
    expect(response.body.data.services).toHaveProperty('api');
    expect(response.body.data.services.api.status).toBe('operational');
  });

  it('should return 404 with standard error envelope for undefined routes', async () => {
    const response = await request(app).get('/api/v1/non-existent-route');

    expect(response.status).toBe(404);
    expect(response.body).toEqual(
      expect.objectContaining({
        success: false,
        statusCode: 404,
        error: 'NotFoundError',
      })
    );
    expect(response.body.meta).toHaveProperty('timestamp');
  });
});
