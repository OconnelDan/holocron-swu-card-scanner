#!/usr/bin/env ts-node

/**
 * Script para enriquecer el Excel de colección con metadatos oficiales de las cartas
 * Descarga datos de SWU-DB API y añade campos faltantes (rarity, type, aspects)
 * Uso: npm run enrich
 */

import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';

// Interfaces para los datos de la API
interface ApiCard {
  id: string;
  name: string;
  set: string;
  number: string;
  rarity: string;
  type: string;
  aspects: string[];
  cost?: number;
  power?: number;
  hp?: number;
}

interface ApiResponse {
  data: ApiCard[];
}

// Mapas de traducción EN → ES
const rarityMap: Record<string, string> = {
  'Legendary': 'legendaria',
  'Rare': 'rara',
  'Uncommon': 'infrecuente',
  'Common': 'comun'
};

const typeMap: Record<string, string> = {
  'Event': 'evento',
  'Upgrade': 'mejora',
  'Unit': 'unidad',
  'Leader': 'unidad_lider',
  'Base': 'unidad_lider', // Leaders también pueden ser Base
  'Token Unit': 'unidad'
};

const aspectMap: Record<string, string> = {
  'Heroism': 'heroismo',
  'Villainy': 'maldad',
  'Command': 'mando',
  'Vigilance': 'vigilancia',
  'Cunning': 'astucia',
  'Aggression': 'agresividad',
  'Neutral': 'incoloro'
};

const setCodeMap: Record<string, string> = {
  'sor': 'SOR',
  'shd': 'SHD',
  'twi': 'TWI',
  'jtl': 'JTL'
};

/**
 * Descarga los datos de cartas desde la API oficial
 */
async function downloadCardData(): Promise<Map<string, ApiCard>> {
  const cacheDir = path.resolve(__dirname, '../.cache');
  const cacheFile = path.join(cacheDir, 'cards.json');

  // Crear directorio de cache si no existe
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }

  let cardsData: ApiCard[] = [];

  // Intentar cargar desde cache primero
  if (fs.existsSync(cacheFile)) {
    console.log('📁 Cargando datos desde cache...');
    cardsData = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));

    // Solo descargar si el cache está muy viejo (más de 7 días)
    const cacheStats = fs.statSync(cacheFile);
    const isVeryOld = Date.now() - cacheStats.mtime.getTime() > 7 * 24 * 60 * 60 * 1000; // 7 días

    if (!isVeryOld) {
      console.log(`✅ Usando cache con ${cardsData.length} cartas`);
      // Crear índice directamente del cache
      const cardIndex = new Map<string, ApiCard>();
      cardsData.forEach(card => {
        const key = `${card.set.toLowerCase()}-${card.number}`;
        cardIndex.set(key, card);
      });
      console.log(`🗂️ Índice creado con ${cardIndex.size} cartas`);
      return cardIndex;
    }
  }

  // Si no hay cache o está viejo, descargar desde API
  if (cardsData.length === 0) {
    console.log('🌐 Descargando datos de cartas desde API...');

    try {
      // Intentar API primero
      const response = await axios.get('https://api.swu-db.com/cards');
      if (response.status === 200) {
        const apiData: ApiResponse = response.data;
        cardsData = apiData.data;
        console.log(`✅ Descargadas ${cardsData.length} cartas desde API`);
      } else {
        throw new Error(`API response: ${response.status}`);
      }
    } catch (error) {
      console.log('⚠️ Error con API, intentando JSON estático...');
      try {
        const response = await axios.get('https://cards.swu.gg/static/cards.json');
        if (response.status === 200) {
          cardsData = response.data;
          console.log(`✅ Descargadas ${cardsData.length} cartas desde JSON estático`);
        } else {
          throw new Error(`Static JSON response: ${response.status}`);
        }
      } catch (staticError) {
        console.error('❌ Error descargando datos de cartas:', staticError);
        process.exit(1);
      }
    }

    // Guardar en cache
    fs.writeFileSync(cacheFile, JSON.stringify(cardsData, null, 2));
    console.log('💾 Datos guardados en cache');
  }

  // Crear índice por set-number
  const cardIndex = new Map<string, ApiCard>();
  cardsData.forEach(card => {
    const key = `${card.set.toLowerCase()}-${card.number}`;
    cardIndex.set(key, card);
  });

  console.log(`🗂️ Índice creado con ${cardIndex.size} cartas`);
  return cardIndex;
}

/**
 * Traduce los valores de la API al español
 */
function translateCard(card: ApiCard): { rarity: string; type: string; aspects: string } {
  const rarity = rarityMap[card.rarity] || card.rarity.toLowerCase();
  const type = typeMap[card.type] || card.type.toLowerCase();
  const aspects = card.aspects.map(aspect => aspectMap[aspect] || aspect.toLowerCase()).join(', ');

  return { rarity, type, aspects };
}

/**
 * Busca una carta en el índice
 */
function findCard(cardIndex: Map<string, ApiCard>, set: string, baseCardId: string): ApiCard | null {
  const setCode = setCodeMap[set.toLowerCase()] || set.toUpperCase();
  const key1 = `${set.toLowerCase()}-${baseCardId}`;
  const key2 = `${setCode}-${baseCardId}`;

  return cardIndex.get(key1) || cardIndex.get(key2) || null;
}

/**
 * Enriquece el Excel con metadatos de las cartas
 */
async function enrichCollection(): Promise<void> {
  try {
    console.log('🚀 Iniciando enriquecimiento de colección...');

    // Descargar datos de cartas
    const cardIndex = await downloadCardData();

    // Leer archivo Excel original
    const excelPath = path.resolve(__dirname, '../../CollectionExport OCONNEL.xlsx');

    if (!fs.existsSync(excelPath)) {
      console.error('❌ No se encontró el archivo Excel en:', excelPath);
      process.exit(1);
    }

    console.log('📖 Leyendo archivo Excel original...');
    const workbook = XLSX.readFile(excelPath);
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      console.error('❌ No se encontraron hojas en el archivo Excel');
      process.exit(1);
    }

    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) {
      console.error('❌ No se pudo leer la hoja del Excel');
      process.exit(1);
    }

    // Convertir a JSON con cabeceras
    const rawData: any[][] = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: '',
      blankrows: false
    });

    const headers = rawData[0] as string[];
    const dataRows = rawData.slice(1);

    console.log('🔍 Cabeceras originales:', headers);

    // Añadir nuevas columnas
    const newHeaders = [...headers, 'Rarity', 'Type', 'Aspects', 'Cost', 'Power', 'HP'];
    const enrichedData: any[][] = [newHeaders];

    let enrichedCount = 0;
    let notFoundCount = 0;
    const notFoundCards: string[] = [];

    // Procesar cada fila
    dataRows.forEach((row: any[]) => {
      const set = String(row[0] || '').toLowerCase().trim();
      const baseCardId = String(row[1] || '').trim();
      const name = String(row[2] || '').trim();

      if (!set || !baseCardId || !name) {
        // Fila vacía, copiar tal como está
        enrichedData.push([...row, '', '', '', '', '', '']);
        return;
      }

      // Buscar carta en el índice
      const card = findCard(cardIndex, set, baseCardId);

      if (card) {
        const translated = translateCard(card);
        const newRow = [
          ...row,
          translated.rarity,
          translated.type,
          translated.aspects,
          card.cost || '',
          card.power || '',
          card.hp || ''
        ];
        enrichedData.push(newRow);
        enrichedCount++;
      } else {
        // No encontrada, dejar campos vacíos
        const newRow = [...row, '', '', '', '', '', ''];
        enrichedData.push(newRow);
        notFoundCount++;
        notFoundCards.push(`${set}-${baseCardId}: ${name}`);
      }
    });

    console.log(`✅ Enriquecidas: ${enrichedCount} cartas`);
    console.log(`⚠️ No encontradas: ${notFoundCount} cartas`);

    if (notFoundCards.length > 0) {
      console.log('🔍 Cartas no encontradas:');
      notFoundCards.slice(0, 10).forEach(card => console.log(`   - ${card}`));
      if (notFoundCards.length > 10) {
        console.log(`   ... y ${notFoundCards.length - 10} más`);
      }
    }

    // Crear nuevo workbook
    const newWorkbook = XLSX.utils.book_new();
    const newWorksheet = XLSX.utils.aoa_to_sheet(enrichedData);
    XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Data');

    // Guardar archivo enriquecido
    const outputPath = path.resolve(__dirname, '../../CollectionExport_enriched.xlsx');
    XLSX.writeFile(newWorkbook, outputPath);

    console.log('💾 Archivo enriquecido guardado en:', outputPath);

    // Validar datos
    console.log('🔍 Validando datos enriquecidos...');

    const validRarities = Object.values(rarityMap);
    const validTypes = Object.values(typeMap);
    const validAspects = Object.values(aspectMap);

    let validationErrors = 0;

    enrichedData.slice(1).forEach((row, index) => {
      const rarity = row[headers.length];
      const type = row[headers.length + 1];
      const aspects = row[headers.length + 2];

      if (rarity && !validRarities.includes(rarity)) {
        console.error(`❌ Rarity inválida en fila ${index + 2}: ${rarity}`);
        validationErrors++;
      }

      if (type && !validTypes.includes(type)) {
        console.error(`❌ Type inválido en fila ${index + 2}: ${type}`);
        validationErrors++;
      }

      if (aspects) {
        const aspectList = aspects.split(', ');
        aspectList.forEach((aspect: string) => {
          if (!validAspects.includes(aspect)) {
            console.error(`❌ Aspect inválido en fila ${index + 2}: ${aspect}`);
            validationErrors++;
          }
        });
      }
    });

    if (validationErrors > 0) {
      console.error(`❌ Se encontraron ${validationErrors} errores de validación`);
      process.exit(1);
    }

    console.log('✅ Validación exitosa - todos los valores están dentro de los enums');
    console.log('🎉 Enriquecimiento completado exitosamente!');

  } catch (error) {
    console.error('❌ Error enriqueciendo colección:', error);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  enrichCollection();
}

export { enrichCollection };
