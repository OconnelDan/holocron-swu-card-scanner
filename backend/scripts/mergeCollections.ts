#!/usr/bin/env ts-node

/**
 * Script para combinar LISTA OCONNEL Coleccion PLUS.xlsx (metadatos) 
 * con CollectionExport OCONNEL.xlsx (cantidades del usuario)
 */

import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

interface UserCard {
  set: string;
  baseCardId: string;
  name: string;
  swudbId: string;
  variants: {
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
  };
  totalQuantity: number;
}

/**
 * Normaliza números de carta para matching
 * PLUS ya viene con formato "001", USER viene con "001" también
 */
function normalizeCardNumber(cardNumber: string): string {
  return cardNumber.toString().padStart(3, '0'); // 1 -> 001, 001 -> 001
}

/**
 * Convierte set del PLUS al formato del USER para matching
 */
function convertPlusSetToUserSet(plusSet: string): string {
  // 1SOR -> sor, 2SHD -> shd, etc.
  return plusSet.replace(/^\d+/, '').toLowerCase();
}

/**
 * Lee y parsea el archivo PLUS manteniendo formato original
 */
function readPlusFile(): any[][] {
  console.log('📖 Leyendo LISTA OCONNEL Coleccion PLUS.xlsx...');

  const plusPath = path.resolve(__dirname, '../../LISTA OCONNEL Coleccion PLUS.xlsx');
  if (!fs.existsSync(plusPath)) {
    throw new Error(`No se encontró: ${plusPath}`);
  }

  const workbook = XLSX.readFile(plusPath);
  const sheetName = workbook.SheetNames[0];

  if (!sheetName) {
    throw new Error('No se encontraron hojas en el archivo Excel');
  }

  const worksheet = workbook.Sheets[sheetName];

  if (!worksheet) {
    throw new Error('No se pudo acceder a la hoja del Excel');
  }

  const rawData: any[][] = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: '',
    blankrows: false
  });

  const headers: string[] = rawData[0] as string[];
  const dataRows = rawData.slice(1).filter(row => row.some(cell => cell !== ''));

  console.log(`📊 PLUS: ${dataRows.length} cartas encontradas`);
  console.log(`📊 Cabeceras: ${headers.join(', ')}`);

  return rawData; // Devolver todo incluidas las cabeceras
}

/**
 * Lee el archivo de colección del usuario (ya procesado)
 */
function readUserCollection(): UserCard[] {
  console.log('📖 Leyendo colección del usuario...');

  const collectionPath = path.resolve(__dirname, '../src/data/collection.json');
  if (!fs.existsSync(collectionPath)) {
    throw new Error(`No se encontró: ${collectionPath}`);
  }

  const jsonData = fs.readFileSync(collectionPath, 'utf8');
  const cards = JSON.parse(jsonData);

  console.log(`📊 Usuario: ${cards.length} cartas en colección`);

  return cards;
}

/**
 * Actualiza las filas del PLUS con datos del usuario
 */
function updatePlusWithUserData(plusData: any[][], userCards: UserCard[]): any[][] {
  console.log('🔄 Actualizando datos del PLUS con colección del usuario...');

  // Crear índice de cartas del usuario
  const userIndex = new Map<string, UserCard>();
  userCards.forEach(card => {
    const key = `${card.set}-${normalizeCardNumber(card.baseCardId)}`;
    userIndex.set(key, card);
  });

  let matchedCount = 0;
  let unmatchedCount = 0;

  // Actualizar cada fila (excepto la cabecera)
  const updatedData = plusData.map((row, index) => {
    if (index === 0) {
      // Cabeceras - no tocar
      return [...row];
    }

    // Datos de la carta
    const plusSet = String(row[0] || ''); // Ej: "1SOR"
    const plusCardNumber = normalizeCardNumber(String(row[1] || '')); // Ej: "001"

    // Convertir set para matching
    const userSetFormat = convertPlusSetToUserSet(plusSet); // "1SOR" -> "sor"
    const matchKey = `${userSetFormat}-${plusCardNumber}`;

    const userCard = userIndex.get(matchKey);

    if (userCard) {
      matchedCount++;

      // Crear nueva fila con datos actualizados
      const updatedRow = [...row];

      // Actualizar columna "Copia" (índice 10)
      updatedRow[10] = userCard.totalQuantity;

      // Actualizar columnas de variantes (índices 11-22)
      updatedRow[11] = userCard.variants.normal;
      updatedRow[12] = userCard.variants.foil;
      updatedRow[13] = userCard.variants.hyperspace;
      updatedRow[14] = userCard.variants.foil_hyperspace;
      updatedRow[15] = userCard.variants.showcase;
      updatedRow[16] = userCard.variants.organized_play;
      updatedRow[17] = userCard.variants.event_exclusive;
      updatedRow[18] = userCard.variants.prerelease_promo;
      updatedRow[19] = userCard.variants.organized_play_foil;
      updatedRow[20] = userCard.variants.standard_prestige;
      updatedRow[21] = userCard.variants.foil_prestige;
      updatedRow[22] = userCard.variants.serialized_prestige;

      return updatedRow;
    } else {
      unmatchedCount++;
      // No hay datos del usuario - mantener la fila original
      return [...row];
    }
  });

  console.log(`✅ Cartas actualizadas: ${matchedCount}`);
  console.log(`⚠️ Sin datos del usuario: ${unmatchedCount}`);

  return updatedData;
}

/**
 * Guarda el archivo PLUS actualizado
 */
function saveUpdatedPlusFile(updatedData: any[][]): void {
  console.log('💾 Guardando archivo PLUS actualizado...');

  // Crear nuevo Excel con la estructura original pero datos actualizados
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(updatedData); // array of arrays to sheet
  XLSX.utils.book_append_sheet(wb, ws, 'Collection');

  const outputPath = path.resolve(__dirname, '../../LISTA_OCONNEL_Coleccion_PLUS_UPDATED.xlsx');
  XLSX.writeFile(wb, outputPath);

  console.log(`📊 Archivo actualizado guardado en: ${outputPath}`);

  // También guardar como JSON para uso en backend
  const jsonData = updatedData.slice(1).map(row => ({
    set: String(row[0] || ''),
    cardNumber: String(row[1] || ''),
    rarity: String(row[2] || ''),
    name: String(row[3] || ''),
    aspect1: String(row[4] || ''),
    aspect2: String(row[5] || ''),
    cost: parseInt(String(row[6])) || null,
    traits: String(row[7] || ''),
    arena: String(row[8] || ''),
    type: String(row[9] || ''),
    copies: parseInt(String(row[10])) || 0,
    variants: {
      normal: parseInt(String(row[11])) || 0,
      foil: parseInt(String(row[12])) || 0,
      hyperspace: parseInt(String(row[13])) || 0,
      foil_hyperspace: parseInt(String(row[14])) || 0,
      showcase: parseInt(String(row[15])) || 0,
      organized_play: parseInt(String(row[16])) || 0,
      event_exclusive: parseInt(String(row[17])) || 0,
      prerelease_promo: parseInt(String(row[18])) || 0,
      organized_play_foil: parseInt(String(row[19])) || 0,
      standard_prestige: parseInt(String(row[20])) || 0,
      foil_prestige: parseInt(String(row[21])) || 0,
      serialized_prestige: parseInt(String(row[22])) || 0
    },
    swudbId: `${convertPlusSetToUserSet(String(row[0]))}-${normalizeCardNumber(String(row[1]))}`
  }));

  const jsonPath = path.resolve(__dirname, '../src/data/complete_collection.json');
  fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2));

  console.log(`📄 JSON guardado en: ${jsonPath}`);
}

async function mergeCollections(): Promise<void> {
  try {
    console.log('🚀 Iniciando actualización del archivo PLUS...');

    const plusData = readPlusFile();
    const userCards = readUserCollection();
    const updatedData = updatePlusWithUserData(plusData, userCards);

    saveUpdatedPlusFile(updatedData);

    // Estadísticas finales
    const cardsWithData = updatedData.slice(1).filter(row =>
      parseInt(String(row[10])) > 0 // Columna "Copia" > 0
    );

    const totalCards = updatedData.length - 1; // -1 por cabeceras
    const ownedCards = cardsWithData.length;
    const totalQuantity = cardsWithData.reduce((sum, row) =>
      sum + (parseInt(String(row[10])) || 0), 0
    );

    // Stats por set
    const setStats: { [key: string]: { total: number, owned: number } } = {};
    updatedData.slice(1).forEach(row => {
      const set = String(row[0] || '').toUpperCase();
      if (!setStats[set]) setStats[set] = { total: 0, owned: 0 };
      setStats[set].total++;
      if (parseInt(String(row[10])) > 0) setStats[set].owned++;
    });

    console.log('\n📊 Estadísticas finales:');
    console.log(`   - Total cartas en PLUS: ${totalCards}`);
    console.log(`   - Cartas que posees: ${ownedCards}`);
    console.log(`   - Cartas físicas totales: ${totalQuantity}`);
    console.log('\n📊 Por sets:');
    Object.entries(setStats).forEach(([set, stats]) => {
      console.log(`   - ${set}: ${stats.owned}/${stats.total} cartas`);
    });

    console.log('\n🎉 Actualización completada exitosamente!');

  } catch (error: any) {
    console.error('💥 Error durante la actualización:', error.message);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  mergeCollections();
}

export { mergeCollections };
