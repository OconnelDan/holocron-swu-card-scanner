#!/usr/bin/env ts-node

/**
 * Script para ejecutar scraping de cartas manualmente
 * Uso: npm run scrape:cards
 */

import { connectToDatabase, disconnectFromDatabase, logger } from '../src/utils';
import { CardScrapingService } from '../src/services/CardScrapingService';

async function main(): Promise<void> {
  try {
    logger.info('=== Iniciando script de scraping de cartas ===');
    
    // Conectamos a la base de datos
    await connectToDatabase();
    
    // Creamos instancia del servicio
    const scrapingService = new CardScrapingService();
    
    // Ejecutamos scraping completo
    const results = await scrapingService.runFullScrape();
    
    logger.info('=== Scraping completado exitosamente ===', {
      cartasSwudb: results.swudbCount,
      cartasEnriquecidas: results.officialCount,
    });
    
  } catch (error) {
    logger.error('Error ejecutando script de scraping:', error);
    process.exit(1);
  } finally {
    // Limpiamos conexión
    await disconnectFromDatabase();
  }
}

// Ejecutamos solo si es llamado directamente
if (require.main === module) {
  main().catch(error => {
    logger.error('Error no manejado en script de scraping:', error);
    process.exit(1);
  });
}
