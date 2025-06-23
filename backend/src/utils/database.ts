import mongoose from 'mongoose';
import { config, isTest } from './config';
import { logger } from './logger';

/**
 * Configuración de la conexión a MongoDB
 */
const mongooseOptions: mongoose.ConnectOptions = {
  // Configuración de connection pool
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  
  // Configuración de buffer
  bufferMaxEntries: 0,
  bufferCommands: false,
  
  // Configuración de retry
  retryWrites: true,
  retryReads: true,
};

/**
 * Conecta a MongoDB usando la URI apropiada según el entorno
 */
export async function connectToDatabase(): Promise<void> {
  try {
    const uri = isTest() ? config.mongodb.testUri : config.mongodb.uri;
    
    await mongoose.connect(uri, mongooseOptions);
    
    logger.info('Conexión a MongoDB establecida correctamente', {
      database: mongoose.connection.name,
      host: mongoose.connection.host,
      port: mongoose.connection.port,
    });
  } catch (error) {
    logger.error('Error conectando a MongoDB:', error);
    throw error;
  }
}

/**
 * Desconecta de MongoDB
 */
export async function disconnectFromDatabase(): Promise<void> {
  try {
    await mongoose.disconnect();
    logger.info('Desconectado de MongoDB correctamente');
  } catch (error) {
    logger.error('Error desconectando de MongoDB:', error);
    throw error;
  }
}

/**
 * Configura los event listeners para MongoDB
 */
export function setupDatabaseEventListeners(): void {
  mongoose.connection.on('connected', () => {
    logger.info('Mongoose conectado a MongoDB');
  });

  mongoose.connection.on('error', (error) => {
    logger.error('Error en la conexión de Mongoose:', error);
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('Mongoose desconectado de MongoDB');
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    try {
      await mongoose.connection.close();
      logger.info('Conexión de Mongoose cerrada por terminación de app');
      process.exit(0);
    } catch (error) {
      logger.error('Error cerrando conexión de Mongoose:', error);
      process.exit(1);
    }
  });
}

/**
 * Limpia la base de datos (solo para tests)
 */
export async function clearDatabase(): Promise<void> {
  if (!isTest()) {
    throw new Error('clearDatabase solo puede usarse en entorno de test');
  }
  
  const collections = mongoose.connection.collections;
  
  for (const key in collections) {
    const collection = collections[key];
    if (collection) {
      await collection.deleteMany({});
    }
  }
  
  logger.info('Base de datos de test limpiada');
}
