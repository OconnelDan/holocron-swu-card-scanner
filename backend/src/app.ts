import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import * as cron from 'node-cron';

import {
  config,
  logger,
  validateConfig,
  connectToDatabase,
  setupDatabaseEventListeners
} from './utils';
import { healthRoutes, cardsRoutes, scansRoutes } from './routes';
import { CardScrapingService } from './services';

/**
 * Aplicación principal de Express
 */
class App {
  public app: Application;
  private scrapingService: CardScrapingService;

  constructor() {
    this.app = express();
    this.scrapingService = new CardScrapingService();

    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
    this.initializeCronJobs();
  }

  /**
   * Configura middlewares de Express
   */
  private initializeMiddlewares(): void {
    // Seguridad
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

    // CORS
    this.app.use(cors({
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    }));

    // Compresión
    this.app.use(compression());

    // Parseo JSON
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Logging de requests
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      logger.info('HTTP Request', {
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
      });
      next();
    });
  }

  /**
   * Configura las rutas de la API
   */
  private initializeRoutes(): void {
    // Health checks (sin /api prefix)
    this.app.use('/', healthRoutes);

    // API routes
    this.app.use('/api/cards', cardsRoutes);
    this.app.use('/api/scans', scansRoutes);

    // Ruta por defecto
    this.app.get('/', (req: Request, res: Response) => {
      res.status(200).json({
        message: 'Holocron SWU Card Scanner API',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        endpoints: {
          health: '/health',
          ready: '/ready',
          cards: '/api/cards',
          scans: '/api/scans',
        },
      });
    });

    // 404 handler
    this.app.use('*', (req: Request, res: Response) => {
      res.status(404).json({
        error: 'Endpoint no encontrado',
        message: `La ruta ${req.method} ${req.originalUrl} no existe`,
        availableEndpoints: ['/health', '/api/cards', '/api/scans'],
      });
    });
  }

  /**
   * Configura manejo de errores
   */
  private initializeErrorHandling(): void {
    // Error handler global
    this.app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
      logger.error('Unhandled error:', {
        error: error.message,
        stack: error.stack,
        url: req.url,
        method: req.method,
      });

      res.status(500).json({
        error: 'Error interno del servidor',
        message: 'Ha ocurrido un error inesperado',
        ...(process.env.NODE_ENV === 'development' && {
          details: error.message,
          stack: error.stack,
        }),
      });

      next();
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('Recibida señal SIGTERM, cerrando servidor gracefully...');
      process.exit(0);
    });

    process.on('SIGINT', () => {
      logger.info('Recibida señal SIGINT, cerrando servidor gracefully...');
      process.exit(0);
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled promise rejection:', { reason, promise });
    });

    process.on('uncaughtException', (error) => {
      logger.error('Uncaught exception:', error);
      process.exit(1);
    });
  }

  /**
   * Configura tareas programadas (cron jobs)
   */
  private initializeCronJobs(): void {
    // Scraping diario a las 00:00 UTC+2
    cron.schedule(config.scraping.schedule, async () => {
      try {
        logger.info('Iniciando scraping programado de cartas');
        const results = await this.scrapingService.runFullScrape();
        logger.info('Scraping programado completado', results);
      } catch (error) {
        logger.error('Error en scraping programado:', error);
      }
    }, {
      timezone: 'Europe/Madrid',
    });

    logger.info('Cron job de scraping configurado', {
      schedule: config.scraping.schedule,
      timezone: 'Europe/Madrid',
    });
  }

  /**
   * Inicia el servidor
   */
  public async start(): Promise<void> {
    try {
      // Validamos configuración
      validateConfig();

      // Conectamos a MongoDB
      await connectToDatabase();
      setupDatabaseEventListeners();

      // Iniciamos servidor HTTP
      this.app.listen(config.port, () => {
        logger.info('Servidor iniciado correctamente', {
          port: config.port,
          environment: config.nodeEnv,
          mongoUri: config.mongodb.uri.replace(/\/\/.*@/, '//***:***@'), // Ocultar credenciales
        });
      });

    } catch (error) {
      logger.error('Error iniciando servidor:', error);
      process.exit(1);
    }
  }
}

export default App;
