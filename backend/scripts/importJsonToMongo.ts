#!/usr/bin/env ts-node

/**
 * Script para importar cartas desde el JSON a MongoDB
 * Uso: npm run import:json
 */

import { connectToDatabase, logger } from '../src/utils';
import { Card } from '../src/models';
import * as fs from 'fs';
import * as path from 'path';

interface CollectionCard {
  name: string;
  set: string;
  number: string;
  quantity: number;
  rarity?: string;
  type?: string;
  cost?: number;
  power?: number;
  hp?: number;
}

/**
 * Mapea códigos de set a nombres completos
 */
function mapSetCodeToName(setCode: string): string {
  const setMapping: Record<string, string> = {
    'SOR': 'Spark of Rebellion',
    'SHD': 'Shadows of the Galaxy',
    'TWI': 'Twilight of the Republic',
    'TWI2': 'Twilight of the Republic 2',
  };
  
  return setMapping[setCode] || setCode;
}

async function importFromJson() {
  try {
    logger.info('🚀 Iniciando importación desde JSON a MongoDB...');

    // Conectar a MongoDB
    await connectToDatabase();

    // Leer el archivo JSON generado
    const jsonPath = path.resolve(__dirname, '../src/data/collection.json');
    
    if (!fs.existsSync(jsonPath)) {
      logger.error('❌ No se encontró el archivo collection.json en:', jsonPath);
      process.exit(1);
    }

    logger.info('📖 Leyendo archivo JSON:', jsonPath);
    
    const jsonData = fs.readFileSync(jsonPath, 'utf8');
    const cards: CollectionCard[] = JSON.parse(jsonData);
    
    logger.info(`📋 Encontradas ${cards.length} cartas en el JSON`);

    // Limpiar colección existente (comentado para evitar problemas de auth)
    // await Card.deleteMany({});
    // logger.info('🗑️ Colección de cartas limpiada');

    // Importar cartas a MongoDB
    let importedCount = 0;

    for (let i = 0; i < cards.length; i++) {
      const cardData = cards[i];
      try {
        // Generar ID único - usar índice si no hay número de carta
        const cardNumber = cardData.number && cardData.number.trim() !== '' 
          ? cardData.number 
          : String(i + 1).padStart(4, '0'); // Usar índice como fallback
        
        const swudbId = `manual-${cardData.set.toLowerCase()}-${cardNumber}`;
        
        // Convertir al formato del modelo de MongoDB
        const cardDoc = {
          swudbId: swudbId, // ID único generado
          name: cardData.name,
          setCode: cardData.set.toUpperCase(),
          setName: mapSetCodeToName(cardData.set.toUpperCase()), // Mapear código a nombre
          cardNumber: cardNumber,
          type: cardData.type || 'Unit',
          rarity: cardData.rarity || 'Common',
          cost: cardData.cost || 0,
          power: cardData.power,
          hp: cardData.hp,
          aspects: ['Heroism'], // Valor por defecto, se puede ajustar después
          traits: [], // Se puede llenar después si es necesario
          keywords: [],
          text: '',
          imageUrl: `https://via.placeholder.com/300x400?text=${encodeURIComponent(cardData.name)}`,
          // Metadatos de la colección
          scrapingMetadata: {
            source: 'manual',
            lastScraped: new Date(),
          }
        };

        const newCard = new Card(cardDoc);
        await newCard.save();
        importedCount++;
        
        if (importedCount % 100 === 0) {
          logger.info(`✅ Importadas ${importedCount} cartas...`);
        }
      } catch (error) {
        logger.error(`❌ Error importando carta ${cardData.name}:`, error);
      }
    }

    logger.info('🎉 Importación a MongoDB completada!');
    logger.info(`📈 Estadísticas:`);
    logger.info(`   • Cartas importadas: ${importedCount}`);
    logger.info(`   • Total procesadas: ${cards.length}`);

    // Verificar importación
    const totalInDB = await Card.countDocuments();
    logger.info(`🔍 Verificación: ${totalInDB} cartas en MongoDB`);

  } catch (error) {
    logger.error('💥 Error durante la importación:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  importFromJson();
}

export { importFromJson };
