import App from './app';
import { logger } from './utils';

/**
 * Punto de entrada principal de la aplicación
 */
async function main(): Promise<void> {
  try {
    logger.info('🚀 Iniciando Holocron SWU Card Scanner Backend...');
    
    const app = new App();
    await app.start();
    
  } catch (error) {
    logger.error('❌ Error fatal iniciando aplicación:', error);
    process.exit(1);
  }
}

// Ejecutamos la aplicación
main();
