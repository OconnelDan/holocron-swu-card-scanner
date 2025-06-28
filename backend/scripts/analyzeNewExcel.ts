#!/usr/bin/env ts-node

/**
 * Script para analizar la estructura del archivo LISTA OCONNEL Coleccion PLUS.xlsx
 * y crear un plan de merge con CollectionExport OCONNEL.xlsx
 */

import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

async function analyzeNewExcel(): Promise<void> {
  try {
    console.log('🔍 Analizando LISTA OCONNEL Coleccion PLUS.xlsx...');

    // Ruta al nuevo archivo Excel
    const newExcelPath = path.resolve(__dirname, '../../LISTA OCONNEL Coleccion PLUS.xlsx');

    if (!fs.existsSync(newExcelPath)) {
      console.error('❌ No se encontró el archivo:', newExcelPath);
      process.exit(1);
    }

    console.log('📖 Leyendo archivo Excel...');
    const workbook = XLSX.readFile(newExcelPath);

    console.log('📊 Hojas disponibles:', workbook.SheetNames);

    // Analizar cada hoja
    for (const sheetName of workbook.SheetNames) {
      console.log(`\n📋 === ANÁLISIS DE HOJA: ${sheetName} ===`);

      const worksheet = workbook.Sheets[sheetName];
      if (!worksheet) continue;

      // Convertir a JSON para analizar estructura
      const rawData: any[][] = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: '',
        blankrows: false
      });

      if (rawData.length === 0) {
        console.log('   (Hoja vacía)');
        continue;
      }

      const headers: string[] = rawData[0] as string[];
      const dataRows = rawData.slice(1).filter(row => row.some(cell => cell !== ''));

      console.log(`📏 Dimensiones: ${headers.length} columnas × ${dataRows.length} filas`);
      console.log('🔤 Columnas:');
      headers.forEach((header, index) => {
        if (header) {
          console.log(`   ${index + 1}. ${header}`);
        }
      });

      // Mostrar algunas filas de ejemplo
      if (dataRows.length > 0) {
        console.log('\n📝 Primeras 3 filas de ejemplo:');
        dataRows.slice(0, 3).forEach((row, index) => {
          console.log(`\n   Fila ${index + 1}:`);
          headers.forEach((header, colIndex) => {
            const value = row[colIndex];
            if (value !== '' && value !== undefined) {
              console.log(`      ${header}: ${value}`);
            }
          });
        });
      }

      // Analizar tipos de datos únicos
      if (dataRows.length > 0) {
        console.log('\n🎨 Valores únicos encontrados:');

        // Buscar columnas que parezcan ser aspectos, rarezas, tipos
        const interestingColumns = headers.filter(h =>
          h && (
            h.toLowerCase().includes('aspect') ||
            h.toLowerCase().includes('rarity') ||
            h.toLowerCase().includes('rare') ||
            h.toLowerCase().includes('type') ||
            h.toLowerCase().includes('tipo') ||
            h.toLowerCase().includes('set')
          )
        );

        interestingColumns.forEach(colName => {
          const colIndex = headers.indexOf(colName);
          const uniqueValues = [...new Set(
            dataRows.map(row => row[colIndex]).filter(val => val !== '' && val !== undefined)
          )].slice(0, 10); // Primeros 10 valores únicos

          console.log(`      ${colName}: [${uniqueValues.join(', ')}]`);
        });
      }
    }

    console.log('\n🎯 Próximo paso: Comparar con CollectionExport OCONNEL.xlsx');

  } catch (error: any) {
    console.error('💥 Error analizando archivo:', error.message);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  analyzeNewExcel();
}

export { analyzeNewExcel };
