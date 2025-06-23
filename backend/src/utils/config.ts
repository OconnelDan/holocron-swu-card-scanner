import dotenv from 'dotenv';

// Cargamos variables de entorno
dotenv.config();

/**
 * Configuración centralizada de la aplicación
 */
export const config = {
  // Server
  port: parseInt(process.env.PORT ?? '3000', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  
  // Database
  mongodb: {
    uri: process.env.MONGODB_URI ?? 'mongodb://localhost:27017/holocron-swu',
    testUri: process.env.MONGODB_TEST_URI ?? 'mongodb://localhost:27017/holocron-swu-test',
  },
  
  // APIs externas
  swudb: {
    baseUrl: process.env.SWUDB_API_BASE_URL ?? 'https://api.swudb.com/v1',
  },
  
  // Scraping
  scraping: {
    schedule: process.env.SCRAPE_SCHEDULE ?? '0 0 * * *', // Diario a las 00:00
    userAgent: process.env.SCRAPE_USER_AGENT ?? 
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    officialSiteUrl: 'https://starwarsunlimited.com/cards',
  },
  
  // Machine Learning
  ml: {
    confidenceThreshold: parseFloat(process.env.TF_CONFIDENCE_THRESHOLD ?? '0.7'),
    modelPath: process.env.TF_MODEL_PATH ?? './models/card-classifier.json',
  },
  
  // Logging
  logging: {
    level: process.env.LOG_LEVEL ?? 'info',
  },
} as const;

/**
 * Valida que todas las variables de entorno requeridas estén presentes
 */
export function validateConfig(): void {
  const requiredVars = ['MONGODB_URI'];
  
  for (const envVar of requiredVars) {
    if (!process.env[envVar]) {
      throw new Error(`Variable de entorno requerida faltante: ${envVar}`);
    }
  }
}

/**
 * Determina si estamos en entorno de desarrollo
 */
export const isDevelopment = (): boolean => config.nodeEnv === 'development';

/**
 * Determina si estamos en entorno de test
 */
export const isTest = (): boolean => config.nodeEnv === 'test';

/**
 * Determina si estamos en entorno de producción
 */
export const isProduction = (): boolean => config.nodeEnv === 'production';
