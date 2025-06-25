import express, { Application, Request, Response } from 'express';
import helmet from 'helmet';
import { logger } from './utils';
import { healthRoutes, cardsRoutes, scansRoutes } from './routes';

/**
 * Versión simplificada del servidor para debugging
 */
class SimpleApp {
  public app: Application;

  constructor() {
    this.app = express();
    this.initializeBasicMiddlewares();
    this.initializeBasicRoutes();
  }
  private initializeBasicMiddlewares(): void {
    // Probando helmet
    logger.info('Agregando helmet...');
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    }));

    this.app.use(express.json());
  }

  private initializeBasicRoutes(): void {
    // Solo ruta básica primero
    this.app.get('/', (_req: Request, res: Response) => {
      res.json({
        message: 'Servidor principal simplificado funcionando',
        timestamp: new Date().toISOString()
      });
    });    // Probar health routes
    logger.info('Agregando health routes...');
    this.app.use(healthRoutes);

    // Probar cards routes
    logger.info('Agregando cards routes...');
    this.app.use('/api/cards', cardsRoutes);

    // Probar scans routes
    logger.info('Agregando scans routes...');
    this.app.use('/api/scans', scansRoutes);
  }

  async start(): Promise<void> {
    const PORT = process.env['PORT'] || 3001;

    this.app.listen(PORT, () => {
      logger.info(`✅ Servidor simplificado corriendo en puerto ${PORT}`);
    }).on('error', (error) => {
      logger.error('❌ Error iniciando servidor simplificado:', error);
    });
  }
}

export default SimpleApp;
