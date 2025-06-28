#!/usr/bin/env ts-node

/**
 * Script para importar colección de cartas a MongoDB con bulkWrite
 * Uso: npm run import:json
 */

import { connectToDatabase } from '../src/utils/database';
import { Card } from '../src/models/Card';
import { logger } from '../src/utils/logger';
import * as fs from 'fs';
import * as path from 'path';

interface CardVariants {
  normal: number;
  foil: number;
  hyperspace: number;
  foil_hyperspace: number;
  showcase: number;
  organized_play: number;
  event_exclusive: number;
  prerelease_promo: number;
  organized_play_foil: number;
  standard_prestige: number;
  foil_prestige: number;
  serialized_prestige: number;
}

interface CollectionCard {
  name: string;
  set: string;
  baseCardId: string;
  variants: CardVariants;
  swudbId: string;
  totalQuantity: number;
}

/**
 * Mapea códigos de set a nombres completos
 */
function getSetName(setCode: string): string {
  const setNames: { [key: string]: string } = {
    'sor': 'Spark of Rebellion',
    'shd': 'Shadows of the Galaxy',
    'twi': 'Twilight of the Republic',
    'jtl': 'Jump to Lightspeed'
  };
  return setNames[setCode.toLowerCase()] || setCode.toUpperCase();
}

/**
 * Transforma carta de colección a formato MongoDB
 */
function transformToMongoCard(collectionCard: CollectionCard): any {
  return {
    name: collectionCard.name,
    subtitle: '', // No disponible en la colección
    text: '', // No disponible en la colección
    type: 'Unit', // Valor por defecto (requerido por el schema)
    aspects: ['Neutral'], // Valor por defecto (requerido por el schema)
    traits: [], // No disponible en la colección
    keywords: [], // No disponible en la colección
    cost: null, // No disponible en la colección
    power: null, // No disponible en la colección
    hp: null, // No disponible en la colección
    setCode: collectionCard.set.toLowerCase(),
    setName: getSetName(collectionCard.set),
    cardNumber: collectionCard.baseCardId,
    rarity: 'Common', // Valor por defecto (requerido por el schema)
    artist: '', // No disponible en la colección
    flavorText: '', // No disponible en la colección
    imageUrl: '', // No disponible en la colección
    swudbId: collectionCard.swudbId,
    lastUpdated: new Date(),

    // Información de colección personal
    personalCollection: {
      owned: true,
      quantity: collectionCard.totalQuantity,
      variants: collectionCard.variants,
      lastUpdated: new Date()
    }
  };
}

async function importJsonToMongo() {
  try {
    logger.info('🚀 Iniciando importación de JSON a MongoDB...');

    // Conectar a MongoDB
    await connectToDatabase();
    logger.info('✅ Conectado a MongoDB');

    // Leer archivo JSON
    const jsonPath = path.resolve(__dirname, '../src/data/collection.json');

    if (!fs.existsSync(jsonPath)) {
      logger.error('❌ No se encontró el archivo JSON en:', jsonPath);
      process.exit(1);
    }

    const jsonData = fs.readFileSync(jsonPath, 'utf8');
    const cards: CollectionCard[] = JSON.parse(jsonData);

    logger.info(`📋 Cargadas ${cards.length} cartas del JSON`);

    // Limpiar colección existente (opcional)
    logger.info('🧹 Limpiando colección existente...');
    await Card.deleteMany({});

    // Preparar operaciones de bulkWrite
    const bulkOps = cards.map(card => ({
      insertOne: {
        document: transformToMongoCard(card)
      }
    }));

    logger.info(`📦 Preparando ${bulkOps.length} operaciones de inserción...`);

    // Ejecutar bulkWrite con ordered: false para continuar en caso de duplicados
    let importedCount = 0;
    let errorCount = 0;

    try {
      const result = await Card.bulkWrite(bulkOps, {
        ordered: false,
        bypassDocumentValidation: false
      });

      importedCount = result.insertedCount;
      logger.info(`✅ Cartas importadas exitosamente: ${importedCount}`);

    } catch (error: any) {
      // Manejar errores de duplicados individualmente
      if (error.name === 'BulkWriteError' && error.result) {
        importedCount = error.result.insertedCount;
        errorCount = error.writeErrors?.length || 0;

        logger.info(`✅ Cartas importadas: ${importedCount}`);
        logger.warn(`⚠️ Errores (probablemente duplicados): ${errorCount}`);

        // Loguear algunos errores específicos
        if (error.writeErrors && error.writeErrors.length > 0) {
          error.writeErrors.slice(0, 5).forEach((writeError: any) => {
            if (writeError.err.code === 11000) {
              const duplicateKey = JSON.stringify(writeError.err.keyValue);
              logger.warn(`🔄 Clave duplicada: ${duplicateKey}`);
            } else {
              logger.error(`❌ Error de escritura:`, writeError.err);
            }
          });

          if (error.writeErrors.length > 5) {
            logger.warn(`... y ${error.writeErrors.length - 5} errores más`);
          }
        }
      } else {
        throw error;
      }
    }

    // Verificar resultados
    const totalInMongo = await Card.countDocuments();
    logger.info(`🔍 Verificación: ${totalInMongo} cartas en MongoDB`);

    // Mostrar estadísticas
    const setStats = await Card.aggregate([
      {
        $group: {
          _id: '$setCode',
          count: { $sum: 1 },
          totalQuantity: { $sum: '$personalCollection.quantity' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    logger.info('📊 Estadísticas por set:');
    setStats.forEach(stat => {
      logger.info(`   - ${stat._id.toUpperCase()}: ${stat.count} cartas únicas, ${stat.totalQuantity} cartas físicas`);
    });

    logger.info('🎉 Importación a MongoDB completada!');
    logger.info('📈 Estadísticas:');
    logger.info(`   • Cartas importadas: ${importedCount}`);
    logger.info(`   • Total procesadas: ${cards.length}`);
    logger.info(`   • Errores: ${errorCount}`);

    return {
      success: true,
      imported: importedCount,
      total: cards.length,
      errors: errorCount
    };

  } catch (error: any) {
    logger.error('💥 Error durante la importación:', error);
    return {
      success: false,
      error: error.message
    };
  } finally {
    // Cerrar conexión
    process.exit(0);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  importJsonToMongo();
}

export { importJsonToMongo };
