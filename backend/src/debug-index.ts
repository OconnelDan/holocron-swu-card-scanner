import SimpleApp from './debug-app';
import { logger } from './utils';

async function main(): Promise<void> {
  try {
    logger.info('🔍 Iniciando servidor de debug...');

    const app = new SimpleApp();
    await app.start();

  } catch (error) {
    logger.error('❌ Error en servidor de debug:', error);
    process.exit(1);
  }
}

main();
