#!/usr/bin/env ts-node

/**
 * Script para descargar TODAS las cartas de Star Wars Unlimited
 * desde las APIs oficiales y crear una base de datos completa
 */

import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

interface SWUCard {
  id: string;
  name: string;
  subtitle?: string;
  type: string;
  aspects: string[];
  traits: string[];
  arenas?: string[];
  cost?: number;
  power?: number;
  hp?: number;
  text?: string;
  rarity: string;
  set: {
    id: string;
    name: string;
    code: string;
  };
  number: string;
  artist?: string;
  imageUrl?: string;
  variantType?: string;
  epicAction?: boolean;
  unique?: boolean;
}

interface CardIndex {
  [key: string]: SWUCard; // key será setCode-cardNumber
}

/**
 * Lista de endpoints alternativos para intentar
 */
const API_ENDPOINTS = [
  'https://api.swu-db.com/cards',
  'https://swu-db.com/api/cards',
  'https://cards.swu.gg/static/cards.json',
  'https://raw.githubusercontent.com/swu-db/swu-db-data/main/cards.json',
  'https://api.github.com/repos/swu-db/swu-db-data/contents/cards.json'
];

/**
 * Descarga cartas desde SWU-DB API con múltiples intentos
 */
async function downloadFromSWUDB(): Promise<SWUCard[]> {
  console.log('🔄 Intentando descargar desde SWU-DB API...');
  
  const endpoints = [
    'https://api.swu-db.com/cards',
    'https://swu-db.com/api/cards'
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`   Probando: ${endpoint}`);
      const response = await axios.get(endpoint, {
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'application/json',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'no-cache'
        },
        validateStatus: (status) => status < 500 // Aceptar códigos de estado menores a 500
      });
      
      if (response.data && Array.isArray(response.data)) {
        console.log(`✅ Descargadas ${response.data.length} cartas desde ${endpoint}`);
        return response.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        console.log(`✅ Descargadas ${response.data.data.length} cartas desde ${endpoint}`);
        return response.data.data;
      }
    } catch (error: any) {
      console.warn(`   ❌ Error con ${endpoint}:`, error.message);
    }
  }
  
  throw new Error('No se pudo descargar desde SWU-DB');
}

/**
 * Descarga cartas desde múltiples fuentes alternativas
 */
async function downloadFromAlternatives(): Promise<SWUCard[]> {
  console.log('🔄 Intentando descargar desde fuentes alternativas...');
  
  const endpoints = [
    'https://cards.swu.gg/static/cards.json',
    'https://raw.githubusercontent.com/swu-db/swu-db-data/main/cards.json',
    'https://cdn.jsdelivr.net/gh/swu-db/swu-db-data@main/cards.json'
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`   Probando: ${endpoint}`);
      const response = await axios.get(endpoint, {
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'application/json',
          'Accept-Language': 'en-US,en;q=0.9'
        }
      });
      
      if (response.data && Array.isArray(response.data)) {
        console.log(`✅ Descargadas ${response.data.length} cartas desde ${endpoint}`);
        return response.data;
      }
    } catch (error: any) {
      console.warn(`   ❌ Error con ${endpoint}:`, error.message);
    }
  }
  
  throw new Error('No se pudo descargar desde fuentes alternativas');
}

/**
 * Normaliza los datos de carta independientemente de la fuente
 */
function normalizeCard(card: any): SWUCard | null {
  try {
    // Detectar formato y normalizar
    const normalized: SWUCard = {
      id: card.id || card.swudbId || `${card.set?.code || card.setCode}-${card.number || card.cardNumber}`,
      name: card.name || '',
      subtitle: card.subtitle || '',
      type: card.type || '',
      aspects: Array.isArray(card.aspects) ? card.aspects : (card.aspect ? [card.aspect] : []),
      traits: Array.isArray(card.traits) ? card.traits : [],
      arenas: card.arenas || (card.arena ? [card.arena] : []),
      cost: card.cost || null,
      power: card.power || null,
      hp: card.hp || null,
      text: card.text || '',
      rarity: card.rarity || '',
      set: {
        id: card.set?.id || card.setId || card.set?.code || card.setCode || '',
        name: card.set?.name || card.setName || '',
        code: (card.set?.code || card.setCode || '').toLowerCase()
      },
      number: card.number || card.cardNumber || '',
      artist: card.artist || '',
      imageUrl: card.imageUrl || card.image || '',
      variantType: card.variantType || card.variant || '',
      epicAction: card.epicAction || false,
      unique: card.unique || false
    };

    // Validar datos mínimos requeridos
    if (!normalized.name || !normalized.set.code || !normalized.number) {
      console.warn('⚠️ Carta con datos incompletos:', {
        name: normalized.name,
        set: normalized.set.code,
        number: normalized.number
      });
      return null;
    }

    return normalized;
  } catch (error) {
    console.warn('⚠️ Error normalizando carta:', error);
    return null;
  }
}

/**
 * Crea un índice por setCode-cardNumber
 */
function createCardIndex(cards: SWUCard[]): CardIndex {
  const index: CardIndex = {};
  
  cards.forEach(card => {
    const key = `${card.set.code.toLowerCase()}-${card.number}`;
    if (!index[key]) {
      index[key] = card;
    } else {
      // Si ya existe, mantener la que tenga más información
      const existing = index[key];
      const current = card;
      
      if (Object.keys(current).length > Object.keys(existing).length) {
        index[key] = current;
      }
    }
  });
  
  return index;
}

async function downloadAllCards(): Promise<void> {
  try {
    console.log('🚀 Iniciando descarga completa de cartas SWU...');
    
    let allCards: SWUCard[] = [];
    let sourceUsed = '';
    
    // Intentar primero SWU-DB
    try {
      const swudbCards = await downloadFromSWUDB();
      const normalizedCards = swudbCards
        .map(normalizeCard)
        .filter((card): card is SWUCard => card !== null);
      
      if (normalizedCards.length > 0) {
        allCards = normalizedCards;
        sourceUsed = 'SWU-DB';
      }
    } catch (error) {
      console.log('❌ SWU-DB no disponible, intentando alternativa...');
    }
    
    // Si no funcionó, intentar fuentes alternativas
    if (allCards.length === 0) {
      try {
        const altCards = await downloadFromAlternatives();
        const normalizedCards = altCards
          .map(normalizeCard)
          .filter((card): card is SWUCard => card !== null);
        
        if (normalizedCards.length > 0) {
          allCards = normalizedCards;
          sourceUsed = 'Alternativas';
        }
      } catch (error) {
        console.log('❌ Fuentes alternativas tampoco disponibles');
      }
    }
    
    if (allCards.length === 0) {
      throw new Error('No se pudieron descargar cartas de ninguna fuente');
    }
    
    console.log(`✅ Descargadas ${allCards.length} cartas desde ${sourceUsed}`);
    
    // Crear índice por setCode-cardNumber
    const cardIndex = createCardIndex(allCards);
    console.log(`📚 Creado índice con ${Object.keys(cardIndex).length} cartas únicas`);
    
    // Guardar datos completos
    const outputDir = path.resolve(__dirname, '../data');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const allCardsPath = path.join(outputDir, 'all_cards.json');
    const cardIndexPath = path.join(outputDir, 'card_index.json');
    
    fs.writeFileSync(allCardsPath, JSON.stringify(allCards, null, 2));
    fs.writeFileSync(cardIndexPath, JSON.stringify(cardIndex, null, 2));
    
    console.log('💾 Datos guardados en:');
    console.log(`   - ${allCardsPath}`);
    console.log(`   - ${cardIndexPath}`);
    
    // Mostrar estadísticas
    const setStats: { [key: string]: number } = {};
    const rarityStats: { [key: string]: number } = {};
    const typeStats: { [key: string]: number } = {};
    
    Object.values(cardIndex).forEach(card => {
      setStats[card.set.code] = (setStats[card.set.code] || 0) + 1;
      rarityStats[card.rarity] = (rarityStats[card.rarity] || 0) + 1;
      typeStats[card.type] = (typeStats[card.type] || 0) + 1;
    });
    
    console.log('\n📊 Estadísticas de cartas descargadas:');
    console.log('Sets:', Object.entries(setStats).map(([set, count]) => `${set.toUpperCase()}: ${count}`).join(', '));
    console.log('Rarezas:', Object.entries(rarityStats).map(([rarity, count]) => `${rarity}: ${count}`).join(', '));
    console.log('Tipos:', Object.entries(typeStats).map(([type, count]) => `${type}: ${count}`).join(', '));
    
    console.log('\n🎉 Descarga completa finalizada!');
    
  } catch (error: any) {
    console.error('💥 Error durante la descarga:', error.message);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  downloadAllCards();
}

export { downloadAllCards };
