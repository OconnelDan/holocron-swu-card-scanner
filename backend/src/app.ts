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
   */  private initializeMiddlewares(): void {
    // Helmet para seguridad
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

    // CORS manual headers para desarrollo
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

      if (req.method === 'OPTIONS') {
        res.sendStatus(200);
      } else {
        next();
      }
    });

    // CORS
    this.app.use(cors({
      origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:8000', 'http://127.0.0.1:8000', 'null'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }));

    // Compresión
    this.app.use(compression());

    // Parseo JSON
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Logging de requests
    this.app.use((req: Request, _res: Response, next: NextFunction) => {
      logger.info('HTTP Request', {
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
      });
      next();
    });
  }  /**
   * Configura las rutas de la API
   */
  private initializeRoutes(): void {
    // Ruta por defecto primero
    this.app.get('/', (_req: Request, res: Response) => {
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

    // Health checks específicos
    this.app.use(healthRoutes);

    // API routes
    this.app.use('/api/cards', cardsRoutes);
    this.app.use('/api/scans', scansRoutes);

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
  private initializeErrorHandling(): void {    // Error handler global
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
        ...(process.env['NODE_ENV'] === 'development' && {
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
  }  /**
   * Configura tareas programadas (cron jobs)
   */
  private initializeCronJobs(): void {
    // Scraping diario a las 00:00 UTC+2
    cron.schedule(config['scraping']['schedule'], async () => {
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
      schedule: config['scraping']['schedule'],
      timezone: 'Europe/Madrid',
    });
  }

  /**
   * Inicia el servidor
   */
  public async start(): Promise<void> {
    try {      // Validamos configuración
      validateConfig();

      // Conectamos a MongoDB 
      await connectToDatabase();
      setupDatabaseEventListeners();

      // Iniciamos servidor HTTP
      this.app.listen(config['port'], () => {
        logger.info('Servidor iniciado correctamente', {
          port: config['port'],
          environment: config['nodeEnv'],
          mongoUri: config['mongodb']['uri'].replace(/\/\/.*@/, '//***:***@'), // Ocultar credenciales
        });
      });

    } catch (error) {
      logger.error('Error iniciando servidor:', error);
      process.exit(1);
    }
  }
}

export default App;
