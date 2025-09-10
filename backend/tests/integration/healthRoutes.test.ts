import request from 'supertest';
import app from '../../src/app';

describe('Health API Routes', () => {
  describe('GET /health', () => {
    it('should return health status successfully', async () => {
      const response = await request(app).get('/health').expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          status: 'healthy',
          timestamp: expect.any(String),
          uptime: expect.any(Number),
          database: 'connected',
          environment: expect.any(String),
          version: expect.any(String),
        },
      });
    });

    it('should include valid timestamp', async () => {
      const response = await request(app).get('/health').expect(200);

      const timestamp = new Date(response.body.data.timestamp);
      expect(timestamp).toBeInstanceOf(Date);
      expect(timestamp.getTime()).not.toBeNaN();
    });

    it('should include positive uptime', async () => {
      const response = await request(app).get('/health').expect(200);

      expect(response.body.data.uptime).toBeGreaterThan(0);
    });
  });

  describe('GET /health/ping', () => {
    it('should return simple pong response', async () => {
      const response = await request(app).get('/health/ping').expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'pong',
        timestamp: expect.any(String),
      });
    });

    it('should respond quickly (no API delay)', async () => {
      const startTime = Date.now();

      await request(app).get('/health/ping').expect(200);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should respond quickly, not subject to 5-second API delay
      expect(duration).toBeLessThan(1000);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid routes with 404', async () => {
      const response = await request(app).get('/nonexistent-route').expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('not found');
    });

    it('should handle invalid HTTP methods', async () => {
      const response = await request(app).post('/health').expect(404);

      expect(response.body.success).toBe(false);
    });
  });
});
