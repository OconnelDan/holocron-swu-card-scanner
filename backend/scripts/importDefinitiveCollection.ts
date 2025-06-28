import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { Card, ICard } from '../src/models/Card';

// Configuración de la conexión a MongoDB
const MONGODB_URI = process.env['MONGODB_URI'] || 'mongodb://localhost:27017/holocron-swu';

interface CollectionData {
  set: string;
  cardNumber: string;
  rarity: string;
  name: string;
  aspect1: string;
  aspect2?: string;
  cost?: number;
  traits?: string;
  arena?: string;
  type: string;
  copies: number;
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
}

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    process.exit(1);
  }
}

async function importCollection() {
  const filePath = path.join(__dirname, '../src/data/complete_collection.json');

  if (!fs.existsSync(filePath)) {
    console.error(`❌ Archivo no encontrado: ${filePath}`);
    process.exit(1);
  }

  console.log('📖 Leyendo archivo de colección definitiva...');
  const rawData = fs.readFileSync(filePath, 'utf8');
  const collectionData: CollectionData[] = JSON.parse(rawData);

  console.log(`📊 Datos leídos: ${collectionData.length} cartas`);

  // Limpiar la colección existente
  console.log('🗑️ Limpiando colección existente...');
  await Card.deleteMany({});

  // Preparar datos para inserción
  const cardsToInsert = collectionData.map((card) => ({
    swudbId: `${card.set}-${card.cardNumber}`,
    setCode: card.set,
    cardNumber: card.cardNumber,
    name: card.name,
    rarity: card.rarity as ICard['rarity'],
    type: card.type as ICard['type'],
    aspect1: card.aspect1 as ICard['aspect1'],
    aspect2: card.aspect2 ? (card.aspect2 as ICard['aspect1']) : undefined,
    cost: card.cost || undefined,
    traits: card.traits || undefined,
    arena: (card.arena && card.arena !== '' ? card.arena : undefined) as ICard['arena'],
    copies: card.copies,
    variants: card.variants,
    lastUpdated: new Date(),
  }));

  // Insertar en lotes para mejor rendimiento
  const batchSize = 100;
  let insertedCount = 0;
  let errorCount = 0;

  console.log('📥 Insertando cartas en MongoDB...');

  for (let i = 0; i < cardsToInsert.length; i += batchSize) {
    const batch = cardsToInsert.slice(i, i + batchSize);

    try {
      await Card.insertMany(batch, { ordered: false });
      insertedCount += batch.length;
      console.log(`✅ Insertadas ${insertedCount}/${cardsToInsert.length} cartas`);
    } catch (error: any) {
      console.error(`❌ Error en lote ${Math.floor(i / batchSize) + 1}:`, error.message);

      // Intentar insertar carta por carta en caso de error
      for (const cardData of batch) {
        try {
          await Card.create(cardData);
          insertedCount++;
        } catch (cardError: any) {
          errorCount++;
          console.error(`❌ Error insertando carta ${cardData.swudbId}:`, cardError.message);
        }
      }
    }
  }

  // Generar estadísticas finales
  const totalCards = await Card.countDocuments({});
  const ownedCards = await Card.countDocuments({ copies: { $gt: 0 } });
  const totalPhysicalCards = await Card.aggregate([
    { $group: { _id: null, total: { $sum: '$copies' } } }
  ]);

  // Estadísticas por set
  const statsBySet = await Card.aggregate([
    {
      $group: {
        _id: '$setCode',
        totalCards: { $sum: 1 },
        ownedCards: { $sum: { $cond: [{ $gt: ['$copies', 0] }, 1, 0] } },
        totalPhysicalCards: { $sum: '$copies' }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  console.log('\n📊 ESTADÍSTICAS DE IMPORTACIÓN:');
  console.log(`✅ Cartas insertadas correctamente: ${insertedCount}`);
  console.log(`❌ Errores de inserción: ${errorCount}`);
  console.log(`📈 Total de cartas únicas en DB: ${totalCards}`);
  console.log(`🎯 Cartas poseídas: ${ownedCards}`);
  console.log(`🃏 Total de cartas físicas: ${totalPhysicalCards[0]?.total || 0}`);

  console.log('\n📊 ESTADÍSTICAS POR SET:');
  statsBySet.forEach(stat => {
    const percentage = ((stat.ownedCards / stat.totalCards) * 100).toFixed(1);
    console.log(`${stat._id}: ${stat.ownedCards}/${stat.totalCards} (${percentage}%) - ${stat.totalPhysicalCards} físicas`);
  });

  return {
    insertedCount,
    errorCount,
    totalCards,
    ownedCards,
    totalPhysicalCards: totalPhysicalCards[0]?.total || 0
  };
}

async function main() {
  try {
    console.log('🚀 Iniciando importación de colección definitiva...');

    await connectDB();
    const stats = await importCollection();

    console.log('\n✅ Importación completada exitosamente!');
    console.log(`📊 Resumen: ${stats.insertedCount} cartas importadas, ${stats.errorCount} errores`);

  } catch (error) {
    console.error('❌ Error durante la importación:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔚 Conexión a MongoDB cerrada');
  }
}

// Ejecutar solo si este archivo es llamado directamente
if (require.main === module) {
  main();
}

export { importCollection, main as importDefinitiveCollection };
