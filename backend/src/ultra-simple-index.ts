import UltraSimpleApp from './ultra-simple-app';
import { logger } from './utils';

async function main(): Promise<void> {
  try {
    logger.info('🔬 Iniciando servidor ultra simple...');

    const app = new UltraSimpleApp();
    await app.start();

  } catch (error) {
    logger.error('❌ Error en servidor ultra simple:', error);
    process.exit(1);
  }
}

main();
