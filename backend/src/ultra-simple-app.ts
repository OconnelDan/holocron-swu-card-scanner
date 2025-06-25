import express, { Application, Request, Response } from 'express';
import helmet from 'helmet';
import { logger, config, validateConfig } from './utils';
import { healthRoutes, cardsRoutes, scansRoutes } from './routes';

/**
 * Versión ultra simplificada del servidor principal
 */
class UltraSimpleApp {
  public app: Application;
  constructor() {
    this.app = express();
    
    // TEST 1: Agregando helmet
    logger.info('🔬 TEST 1: Agregando helmet...');
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
    
    // Solo middlewares básicos
    this.app.use(express.json());

    // Rutas exactamente como en debug
    this.app.get('/', (_req: Request, res: Response) => {
      res.json({
        message: 'Servidor principal ultra simple funcionando',
        timestamp: new Date().toISOString()
      });
    });

    this.app.use(healthRoutes);
    this.app.use('/api/cards', cardsRoutes);
    this.app.use('/api/scans', scansRoutes);
  }

  public async start(): Promise<void> {
    try {
      validateConfig();

      this.app.listen(config['port'], () => {
        logger.info('Servidor ultra simple iniciado correctamente', {
          port: config['port'],
          environment: config['nodeEnv'],
        });
      });

    } catch (error) {
      logger.error('Error iniciando servidor ultra simple:', error);
      process.exit(1);
    }
  }
}

export default UltraSimpleApp;
