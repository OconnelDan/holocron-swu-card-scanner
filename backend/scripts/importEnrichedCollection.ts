#!/usr/bin/env ts-node

/**
 * Script para importar la colección enriquecida desde Excel a MongoDB
 * Lee el archivo CollectionExport_enriched.xlsx que contiene metadatos reales
 * Uso: npm run import:enriched
 */

import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';
import { MongoClient } from 'mongodb';
import { config } from 'dotenv';

// Cargar variables de entorno
config();

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

interface MongoCard {
  name: string;
  swudbId: string; // formato: {set}-{baseCardId}
  set: string;
  baseCardId: string;
  rarity: string;
  type: string;
  aspects: string[];
  cost?: number;
  power?: number;
  hp?: number;
  personalCollection: {
    variants: CardVariants;
    totalQuantity: number;
  };
}

/**
 * Normaliza nombres de cabecera para el mapeo
 */
function normalizeHeader(header: string): string {
  return header
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/&/g, 'and')
    .replace(/[^\w]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

/**
 * Convierte valor a número seguro
 */
function safeNumber(value: any): number {
  if (value === null || value === undefined || value === '') {
    return 0;
  }
  const num = parseInt(String(value));
  return isNaN(num) ? 0 : Math.max(0, num);
}

/**
 * Procesa el archivo Excel enriquecido
 */
function processEnrichedExcel(filePath: string): MongoCard[] {
  console.log('📖 Leyendo archivo Excel enriquecido:', filePath);

  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];

  if (!sheetName) {
    throw new Error('No se encontraron hojas en el archivo Excel');
  }

  const worksheet = workbook.Sheets[sheetName];
  if (!worksheet) {
    throw new Error('No se pudo leer la hoja del Excel');
  }

  // Convertir a JSON con cabeceras
  const rawData: any[][] = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: '',
    blankrows: false
  });

  if (rawData.length < 2) {
    throw new Error('El Excel debe tener al menos cabeceras y una fila de datos');
  }

  const headers: string[] = rawData[0] as string[];
  const dataRows = rawData.slice(1);

  console.log('🔍 Cabeceras detectadas:', headers);
  console.log('📊 Filas de datos:', dataRows.length);

  // Crear mapeo de índices de columnas
  const columnIndexes: Record<string, number> = {};
  headers.forEach((header, index) => {
    const normalized = normalizeHeader(header);
    columnIndexes[normalized] = index;
  });

  // Verificar que tenemos las columnas necesarias
  const requiredColumns = ['set', 'base_card_id', 'name', 'rarity', 'type', 'aspects'];
  const missingColumns = requiredColumns.filter(col => columnIndexes[col] === undefined);

  if (missingColumns.length > 0) {
    console.warn('⚠️ Columnas faltantes:', missingColumns);
  }

  const processedCards = new Map<string, MongoCard>();
  let processedRows = 0;
  let skippedRows = 0;

  dataRows.forEach((row: any[]) => {
    try {
      const setIndex = columnIndexes['set'];
      const baseCardIdIndex = columnIndexes['base_card_id'];
      const nameIndex = columnIndexes['name'];

      if (setIndex === undefined || baseCardIdIndex === undefined || nameIndex === undefined) {
        skippedRows++;
        return;
      }

      const set = String(row[setIndex] || '').toLowerCase().trim();
      const baseCardId = String(row[baseCardIdIndex] || '').trim();
      const name = String(row[nameIndex] || '').trim();

      // Validar datos esenciales
      if (!set || !baseCardId || !name) {
        skippedRows++;
        return;
      }

      const swudbId = `${set}-${baseCardId}`;

      // Obtener metadatos (con valores por defecto si están vacíos)
      const rarityIndex = columnIndexes['rarity'];
      const typeIndex = columnIndexes['type'];
      const aspectsIndex = columnIndexes['aspects'];

      const rarity = rarityIndex !== undefined ? String(row[rarityIndex] || 'comun').trim() : 'comun';
      const type = typeIndex !== undefined ? String(row[typeIndex] || 'unidad').trim() : 'unidad';
      const aspectsStr = aspectsIndex !== undefined ? String(row[aspectsIndex] || 'incoloro').trim() : 'incoloro';
      const aspects = aspectsStr ? aspectsStr.split(', ').map(a => a.trim()) : ['incoloro'];

      // Obtener estadísticas opcionales
      const costIndex = columnIndexes['cost'];
      const powerIndex = columnIndexes['power'];
      const hpIndex = columnIndexes['hp'];

      const cost = costIndex !== undefined ? safeNumber(row[costIndex]) : undefined;
      const power = powerIndex !== undefined ? safeNumber(row[powerIndex]) : undefined;
      const hp = hpIndex !== undefined ? safeNumber(row[hpIndex]) : undefined;

      // Calcular variantes
      const variants: CardVariants = {
        normal: columnIndexes['normal'] !== undefined ? safeNumber(row[columnIndexes['normal']]) : 0,
        foil: columnIndexes['foil'] !== undefined ? safeNumber(row[columnIndexes['foil']]) : 0,
        hyperspace: columnIndexes['hyperspace'] !== undefined ? safeNumber(row[columnIndexes['hyperspace']]) : 0,
        foil_hyperspace: columnIndexes['foil_and_hyperspace'] !== undefined ? safeNumber(row[columnIndexes['foil_and_hyperspace']]) : 0,
        showcase: columnIndexes['showcase'] !== undefined ? safeNumber(row[columnIndexes['showcase']]) : 0,
        organized_play: columnIndexes['organized_play'] !== undefined ? safeNumber(row[columnIndexes['organized_play']]) : 0,
        event_exclusive: columnIndexes['event_exclusive'] !== undefined ? safeNumber(row[columnIndexes['event_exclusive']]) : 0,
        prerelease_promo: columnIndexes['prerelease_promo'] !== undefined ? safeNumber(row[columnIndexes['prerelease_promo']]) : 0,
        organized_play_foil: columnIndexes['organized_play_foil'] !== undefined ? safeNumber(row[columnIndexes['organized_play_foil']]) : 0,
        standard_prestige: columnIndexes['standard_prestige'] !== undefined ? safeNumber(row[columnIndexes['standard_prestige']]) : 0,
        foil_prestige: columnIndexes['foil_prestige'] !== undefined ? safeNumber(row[columnIndexes['foil_prestige']]) : 0,
        serialized_prestige: columnIndexes['serialized_prestige'] !== undefined ? safeNumber(row[columnIndexes['serialized_prestige']]) : 0
      };

      const totalQuantity = Object.values(variants).reduce((sum, qty) => sum + qty, 0);

      // Solo procesar si tiene cantidad > 0
      if (totalQuantity > 0) {
        if (processedCards.has(swudbId)) {
          // Si ya existe, sumar cantidades
          const existingCard = processedCards.get(swudbId)!;
          Object.keys(variants).forEach((key) => {
            (existingCard.personalCollection.variants as any)[key] += (variants as any)[key];
          });
          existingCard.personalCollection.totalQuantity += totalQuantity;
        } else {
          // Crear nueva carta
          const card: MongoCard = {
            name,
            swudbId,
            set,
            baseCardId,
            rarity,
            type,
            aspects,
            personalCollection: {
              variants,
              totalQuantity
            }
          };

          // Añadir estadísticas si están disponibles
          if (cost !== undefined && cost > 0) card.cost = cost;
          if (power !== undefined && power > 0) card.power = power;
          if (hp !== undefined && hp > 0) card.hp = hp;

          processedCards.set(swudbId, card);
        }
        processedRows++;
      } else {
        skippedRows++;
      }

    } catch (error) {
      console.error(`❌ Error procesando fila:`, error);
      skippedRows++;
    }
  });

  const cards = Array.from(processedCards.values());

  console.log(`✅ Procesadas ${processedRows} filas válidas`);
  console.log(`⚠️ Omitidas ${skippedRows} filas (sin cantidad o datos inválidos)`);
  console.log(`🎯 Total de cartas únicas: ${cards.length}`);

  return cards;
}

/**
 * Importa las cartas a MongoDB
 */
async function importToMongoDB(cards: MongoCard[]): Promise<void> {
  const mongoUri = process.env['MONGODB_URI'] || 'mongodb://localhost:27017/holocron';
  console.log('🔌 Conectando a MongoDB:', mongoUri);

  const client = new MongoClient(mongoUri);

  try {
    await client.connect();
    const db = client.db();
    const collection = db.collection('cards');

    console.log('🗑️ Limpiando colección existente...');
    await collection.deleteMany({});

    console.log('📦 Importando cartas a MongoDB...');

    // Usar bulkWrite para manejar duplicados
    const operations = cards.map(card => ({
      replaceOne: {
        filter: { swudbId: card.swudbId },
        replacement: card,
        upsert: true
      }
    }));

    const result = await collection.bulkWrite(operations, { ordered: false });

    console.log('✅ Importación completada:');
    console.log(`   - Insertadas: ${result.upsertedCount}`);
    console.log(`   - Actualizadas: ${result.modifiedCount}`);
    console.log(`   - Total procesadas: ${result.upsertedCount + result.modifiedCount}`);

    // Verificar algunos documentos
    const sampleCards = await collection.find({}).limit(3).toArray();
    console.log('🔍 Muestra de cartas importadas:');
    sampleCards.forEach(card => {
      console.log(`   - ${card['name']} (${card['swudbId']}) - ${card['rarity']} ${card['type']}`);
      console.log(`     Aspects: ${card['aspects'].join(', ')}`);
      console.log(`     Cantidad total: ${card['personalCollection'].totalQuantity}`);
    });

  } catch (error) {
    console.error('❌ Error importando a MongoDB:', error);
    throw error;
  } finally {
    await client.close();
  }
}

/**
 * Función principal
 */
async function importEnrichedCollection(): Promise<void> {
  try {
    console.log('🚀 Iniciando importación desde Excel enriquecido...');

    // Buscar archivo enriquecido
    const enrichedPath = path.resolve(__dirname, '../../CollectionExport_enriched.xlsx');

    if (!fs.existsSync(enrichedPath)) {
      console.error('❌ No se encontró el archivo Excel enriquecido en:', enrichedPath);
      console.error('💡 Ejecuta primero: npm run enrich');
      process.exit(1);
    }

    // Procesar Excel
    const cards = processEnrichedExcel(enrichedPath);

    if (cards.length === 0) {
      console.error('❌ No se encontraron cartas válidas para importar');
      process.exit(1);
    }

    // Importar a MongoDB
    await importToMongoDB(cards);

    console.log('🎉 Importación de colección enriquecida completada exitosamente!');

  } catch (error) {
    console.error('❌ Error en importación:', error);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  importEnrichedCollection();
}

export { importEnrichedCollection };
