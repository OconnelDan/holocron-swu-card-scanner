import { Request, Response } from 'express';
import { logger } from '../utils';

/**
 * Controller para health checks y status
 */
export class HealthController {
  /**
   * Health check básico
   */
  static async getHealth(req: Request, res: Response): Promise<void> {
    try {
      const healthInfo = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env['NODE_ENV'] || 'development',
        version: process.env['npm_package_version'] || '1.0.0',
        database: 'connected', // TODO: verificar conexión real
      };

      logger.info('Health check solicitado', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
      });

      res.status(200).json(healthInfo);
    } catch (error) {
      logger.error('Error en health check:', error);
      res.status(503).json({
        status: 'error',
        message: 'Service temporarily unavailable',
      });
    }
  }
  /**
   * Ready check más exhaustivo
   */
  static async getReady(_req: Request, res: Response): Promise<void> {
    try {
      // TODO: Aquí verificaremos conexión DB, modelos TF, etc.
      const readyInfo = {
        status: 'ready',
        timestamp: new Date().toISOString(),
        checks: {
          database: 'ok',
          tensorflow: 'ok',
          scraping: 'ok',
        },
      };

      res.status(200).json(readyInfo);
    } catch (error) {
      logger.error('Error en ready check:', error);
      res.status(503).json({
        status: 'not_ready',
        message: 'Service not ready',
      });
    }
  }
}
