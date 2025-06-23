import request from 'supertest';
import App from '../src/app';

describe('Health Controller', () => {
  let app: App;

  beforeAll(() => {
    app = new App();
  });

  describe('GET /health', () => {
    it('debería devolver status 200 y información de salud', async () => {
      const response = await request(app.app)
        .get('/health')
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          status: 'ok',
          timestamp: expect.any(String),
          uptime: expect.any(Number),
          environment: 'test',
          version: expect.any(String),
          database: 'connected',
        })
      );
    });
  });

  describe('GET /ready', () => {
    it('debería devolver status 200 y información de readiness', async () => {
      const response = await request(app.app)
        .get('/ready')
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          status: 'ready',
          timestamp: expect.any(String),
          checks: expect.objectContaining({
            database: 'ok',
            tensorflow: 'ok',
            scraping: 'ok',
          }),
        })
      );
    });
  });
});
