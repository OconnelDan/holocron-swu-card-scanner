#!/usr/bin/env ts-node

/**
 * Script para importar la colección de cartas desde Excel
 * Uso: npm run import:collection
 */

import * as XLSX from 'xlsx';
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
 * Normaliza nombres de cabecera para el mapeo
 */
function normalizeHeader(header: string): string {
  return header
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/&/g, '')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

/**
 * Mapea las cabeceras del Excel a nuestros campos
 */
function createHeaderMap(headers: string[]): Map<string, string> {
  const map = new Map<string, string>();

  const expectedHeaders: { [key: string]: string } = {
    'set': 'set',
    'base_card_id': 'baseCardId',
    'name': 'name',
    'normal': 'normal',
    'foil': 'foil',
    'hyperspace': 'hyperspace',
    'foil_hyperspace': 'foil_hyperspace',
    'showcase': 'showcase',
    'organized_play': 'organized_play',
    'event_exclusive': 'event_exclusive',
    'prerelease_promo': 'prerelease_promo',
    'organized_play_foil': 'organized_play_foil',
    'standard_prestige': 'standard_prestige',
    'foil_prestige': 'foil_prestige',
    'serialized_prestige': 'serialized_prestige'
  };

  headers.forEach((header) => {
    const normalized = normalizeHeader(header);
    if (expectedHeaders[normalized]) {
      map.set(header, expectedHeaders[normalized]);
    }
  });

  return map;
}

/**
 * Convierte valor a número, retorna 0 si es NaN/null/undefined
 */
function safeNumber(value: any): number {
  const num = parseInt(value) || 0;
  return isNaN(num) ? 0 : num;
}

async function importCollection() {
  try {
    console.log('🚀 Iniciando importación de colección...');

    // Ruta al archivo Excel
    const excelPath = path.resolve(__dirname, '../../CollectionExport OCONNEL.xlsx');

    if (!fs.existsSync(excelPath)) {
      console.error('❌ No se encontró el archivo Excel en:', excelPath);
      process.exit(1);
    }

    console.log('📖 Leyendo archivo Excel:', excelPath);

    // Leer el archivo Excel con configuración específica
    const workbook = XLSX.readFile(excelPath, {
      type: 'buffer',
      cellDates: false,
      cellNF: false,
      cellText: false
    });

    console.log('📊 Hojas disponibles:', workbook.SheetNames);

    // Usar la hoja 'Data' o la primera disponible
    const sheetName = workbook.SheetNames.includes('Data') ? 'Data' : workbook.SheetNames[0];
    console.log('📋 Usando hoja:', sheetName);

    if (!sheetName) {
      console.error('❌ No se encontraron hojas en el archivo Excel');
      process.exit(1);
    }

    const worksheet = workbook.Sheets[sheetName];

    if (!worksheet) {
      console.error('❌ No se pudo leer la hoja del Excel');
      process.exit(1);
    }

    // Convertir a JSON manteniendo cabeceras originales
    const rawData: any[] = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: '',
      blankrows: false
    });

    if (rawData.length < 2) {
      console.error('❌ El Excel debe tener al menos cabeceras y una fila de datos');
      process.exit(1);
    }

    const headers = rawData[0];
    const dataRows = rawData.slice(1);

    console.log('🔍 Cabeceras detectadas:', headers);
    console.log('📊 Filas de datos:', dataRows.length);

    // Crear mapeo de cabeceras
    const headerMap = createHeaderMap(headers);
    console.log('🗺️ Mapeo de cabeceras:', Object.fromEntries(headerMap));

    // Verificar que tenemos las columnas esenciales
    const requiredFields = ['Set', 'Base card id', 'Name'];
    const missingFields = requiredFields.filter(field =>
      !headers.some((h: string) => normalizeHeader(h) === normalizeHeader(field))
    );

    if (missingFields.length > 0) {
      console.error('❌ Faltan columnas requeridas:', missingFields);
      console.error('❌ Cabeceras encontradas:', headers);
      process.exit(1);
    }

    // Procesar datos
    const processedCards = new Map<string, CollectionCard>();
    let processedRows = 0;
    let skippedRows = 0;

    dataRows.forEach((row: any[], index: number) => {
      try {
        // Crear objeto con mapeo de cabeceras
        const rowData: any = {};
        headers.forEach((header: string, colIndex: number) => {
          const mappedField = headerMap.get(header);
          if (mappedField) {
            rowData[mappedField] = row[colIndex] || '';
          }
        });

        // Validar datos esenciales
        if (!rowData.name || !rowData.baseCardId || !rowData.set) {
          skippedRows++;
          return;
        }

        const set = rowData.set.toLowerCase().trim();
        const baseCardId = rowData.baseCardId.toString().trim();
        const name = rowData.name.trim();
        const swudbId = `${set}-${baseCardId}`;

        // Calcular variantes
        const variants: CardVariants = {
          normal: safeNumber(rowData.normal),
          foil: safeNumber(rowData.foil),
          hyperspace: safeNumber(rowData.hyperspace),
          foil_hyperspace: safeNumber(rowData.foil_hyperspace),
          showcase: safeNumber(rowData.showcase),
          organized_play: safeNumber(rowData.organized_play),
          event_exclusive: safeNumber(rowData.event_exclusive),
          prerelease_promo: safeNumber(rowData.prerelease_promo),
          organized_play_foil: safeNumber(rowData.organized_play_foil),
          standard_prestige: safeNumber(rowData.standard_prestige),
          foil_prestige: safeNumber(rowData.foil_prestige),
          serialized_prestige: safeNumber(rowData.serialized_prestige)
        };

        const totalQuantity = Object.values(variants).reduce((sum, qty) => sum + qty, 0);

        // Solo procesar si tiene cantidad > 0
        if (totalQuantity > 0) {
          if (processedCards.has(swudbId)) {
            // Si ya existe, sumar cantidades
            const existingCard = processedCards.get(swudbId)!;
            Object.keys(variants).forEach(key => {
              (existingCard.variants as any)[key] += (variants as any)[key];
            });
            existingCard.totalQuantity += totalQuantity;
          } else {
            // Crear nueva carta
            const card: CollectionCard = {
              name,
              set,
              baseCardId,
              variants,
              swudbId,
              totalQuantity
            };
            processedCards.set(swudbId, card);
          }
          processedRows++;
        } else {
          skippedRows++;
        }

      } catch (error) {
        console.error(`❌ Error procesando fila ${index + 2}:`, error);
        skippedRows++;
      }
    });

    const cards = Array.from(processedCards.values());

    console.log(`✅ Procesadas ${processedRows} filas válidas`);
    console.log(`⚠️ Omitidas ${skippedRows} filas (sin cantidad o datos inválidos)`);
    console.log(`🎯 Total de cartas únicas: ${cards.length}`);

    // Guardar como JSON para usar en el backend
    const outputPath = path.resolve(__dirname, '../src/data/collection.json');
    const outputDir = path.dirname(outputPath);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, JSON.stringify(cards, null, 2));

    console.log('💾 Colección guardada en:', outputPath);
    console.log('🎉 Importación completada exitosamente!');

    // Mostrar estadísticas
    const stats = {
      totalCards: cards.length,
      totalQuantity: cards.reduce((sum, card) => sum + card.totalQuantity, 0),
      sets: [...new Set(cards.map(card => card.set))].filter(Boolean),
    };

    console.log('📊 Estadísticas de la colección:');
    console.log(`   - Total de cartas únicas: ${stats.totalCards}`);
    console.log(`   - Total de cartas físicas: ${stats.totalQuantity}`);
    console.log(`   - Sets: ${stats.sets.join(', ')}`);

    return {
      success: true,
      processed: cards.length,
      total: processedRows + skippedRows
    };

  } catch (error: any) {
    console.error('❌ Error importando colección:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  importCollection();
}

export { importCollection };
